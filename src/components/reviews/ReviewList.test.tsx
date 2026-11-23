import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../services/apiError'
import { ReviewList, type ReviewListItem } from './ReviewList'

function makeProps(overrides: Partial<Parameters<typeof ReviewList>[0]> = {}) {
  return {
    items: [] as ReviewListItem[],
    isLoading: false,
    isFetching: false,
    isError: false,
    page: 1,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
    onPageChange: vi.fn(),
    ...overrides,
  }
}

describe('ReviewList', () => {
  it('shows the loading skeleton while fetching the first page', () => {
    render(<ReviewList {...makeProps({ isLoading: true })} />)

    expect(screen.getByRole('status')).toHaveTextContent('Carregando avaliações')
  })

  it('shows the empty state when there are no reviews', () => {
    render(<ReviewList {...makeProps()} />)

    expect(screen.getByRole('heading', { name: 'Ainda não há avaliações' })).toBeInTheDocument()
  })

  it('shows an error alert and retries when clicking "Tentar de novo"', async () => {
    const onRetry = vi.fn()
    render(
      <ReviewList
        {...makeProps({
          isError: true,
          error: ApiError.fromResponse(500),
          onRetry,
        })}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('O servidor está com problemas')
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('renders review items with author name, rating, comment, and fallback author', () => {
    const items: ReviewListItem[] = [
      {
        id: 'r1',
        rating: 5,
        comment: 'Incrível, recomendo ir cedo.',
        createdAt: '2026-08-02T19:45:00.000Z',
        authorName: 'Ana Clara',
      },
      {
        id: 'r2',
        rating: 4,
        comment: null,
        createdAt: '2026-08-01T10:00:00.000Z',
        authorName: null,
      },
    ]
    render(<ReviewList {...makeProps({ items })} />)

    expect(screen.getByText('Ana Clara')).toBeInTheDocument()
    expect(screen.getByText('Incrível, recomendo ir cedo.')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Nota 5,0 de 5' })).toBeInTheDocument()
    expect(screen.getByText('Viajante')).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Paginação das avaliações' })).toBeNull()
  })

  it('renders pagination controls and calls onPageChange for next and previous pages', async () => {
    const onPageChange = vi.fn()
    const items: ReviewListItem[] = [
      {
        id: 'r1',
        rating: 5,
        comment: 'Ótimo passeio.',
        createdAt: '2026-08-02T19:45:00.000Z',
        authorName: 'Carlos',
      },
    ]

    const { rerender } = render(
      <ReviewList
        {...makeProps({
          items,
          page: 1,
          totalPages: 3,
          hasPrevious: false,
          hasNext: true,
          onPageChange,
        })}
      />,
    )

    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: 'Próxima' }))
    expect(onPageChange).toHaveBeenCalledWith(2)

    rerender(
      <ReviewList
        {...makeProps({
          items,
          page: 2,
          totalPages: 3,
          hasPrevious: true,
          hasNext: true,
          onPageChange,
        })}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Anterior' }))
    expect(onPageChange).toHaveBeenCalledWith(1)
  })
})
