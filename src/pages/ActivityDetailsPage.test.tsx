import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getActivityDetails } from '../services/activities'
import { ApiError } from '../services/apiError'
import { listReviews } from '../services/reviews'
import { makeActivityDetails, makePublicReview } from '../test/activities'
import { createTestQueryClient } from '../test/query'
import { makeActivityReview, makePaginatedReviews } from '../test/reviews'
import ActivityDetailsPage from './ActivityDetailsPage'

vi.mock('../services/activities', () => ({ getActivityDetails: vi.fn() }))
vi.mock('../services/reviews', () => ({ listReviews: vi.fn() }))

function renderPage(initialEntry = '/activities/a1') {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/activities/:id" element={<ActivityDetailsPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ActivityDetailsPage', () => {
  beforeEach(() => {
    vi.mocked(getActivityDetails).mockReset()
    vi.mocked(listReviews).mockReset()
  })

  it('shows a loading skeleton while the activity details are loading', () => {
    vi.mocked(getActivityDetails).mockReturnValue(new Promise(() => {}))
    renderPage()

    expect(screen.getByRole('status')).toHaveTextContent('Carregando detalhes da atividade')
    expect(listReviews).not.toHaveBeenCalled()
  })

  it('renders activity details, photo, rating, and enriched author names in reviews', async () => {
    vi.mocked(getActivityDetails).mockResolvedValue(
      makeActivityDetails({
        id: 'louvre',
        name: 'Museu do Louvre',
        type: 'TOUR',
        location: 'Rue de Rivoli, 75001',
        city: 'Paris',
        country: 'França',
        description: 'Maior museu de arte do mundo.',
        averageRating: 4.6,
        reviewCount: 2,
        destinationId: 'dest-paris',
        latestReviews: [makePublicReview({ id: 'r1', authorName: 'Gustavo Fidelis' })],
      }),
    )
    vi.mocked(listReviews).mockResolvedValue(
      makePaginatedReviews([
        makeActivityReview({
          id: 'r1',
          activityId: 'louvre',
          rating: 5,
          comment: 'Vale cada minuto da fila.',
        }),
        makeActivityReview({
          id: 'r2',
          activityId: 'louvre',
          rating: 4,
          comment: 'Muito bonito.',
        }),
      ]),
    )

    renderPage('/activities/louvre')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Museu do Louvre' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Passeio')).toBeInTheDocument()
    expect(screen.getByText('Rue de Rivoli, 75001, Paris, França')).toBeInTheDocument()
    expect(screen.getByText('Maior museu de arte do mundo.')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Museu do Louvre' })).toHaveAttribute(
      'src',
      'https://img.test/louvre.jpg',
    )
    expect(screen.getByRole('img', { name: 'Nota 4,6 de 5' })).toHaveTextContent('4,6')
    expect(screen.getByRole('link', { name: 'Ver destino' })).toHaveAttribute(
      'href',
      '/destinations/dest-paris',
    )
    expect(screen.getByRole('link', { name: 'Ver no mapa' })).toHaveAttribute(
      'href',
      'https://maps.google.com/?cid=1234567890',
    )

    const reviewsSection = screen.getByRole('region', { name: 'Avaliações' })
    expect(await within(reviewsSection).findByText('Gustavo Fidelis')).toBeInTheDocument()
    expect(within(reviewsSection).getByText('Vale cada minuto da fila.')).toBeInTheDocument()
    expect(within(reviewsSection).getByText('Viajante')).toBeInTheDocument()
  })

  it('falls back to a placeholder when the activity has no photo or the photo fails to load', async () => {
    vi.mocked(getActivityDetails).mockResolvedValue(
      makeActivityDetails({
        photoUrl: 'https://img.test/broken.jpg',
        averageRating: null,
        reviewCount: 0,
        destinationId: null,
        mapsUrl: null,
        description: null,
        latestReviews: [],
      }),
    )
    vi.mocked(listReviews).mockResolvedValue(makePaginatedReviews([]))

    renderPage()

    const photo = await screen.findByRole('img', { name: 'Museu do Louvre' })
    fireEvent.error(photo)

    expect(screen.queryByRole('img', { name: 'Museu do Louvre' })).not.toBeInTheDocument()
    expect(screen.getByText('Ainda sem nota média')).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: 'Ainda não há avaliações' }),
    ).toBeInTheDocument()
  })

  it('paginates through activity reviews', async () => {
    vi.mocked(getActivityDetails).mockResolvedValue(
      makeActivityDetails({ id: 'a1', reviewCount: 12, latestReviews: [] }),
    )
    vi.mocked(listReviews)
      .mockResolvedValueOnce(
        makePaginatedReviews([makeActivityReview({ id: 'r1', comment: 'Primeira página' })], {
          page: 1,
          limit: 10,
          total: 12,
          totalPages: 2,
          hasNext: true,
          hasPrevious: false,
        }),
      )
      .mockResolvedValueOnce(
        makePaginatedReviews([makeActivityReview({ id: 'r2', comment: 'Segunda página' })], {
          page: 2,
          limit: 10,
          total: 12,
          totalPages: 2,
          hasNext: false,
          hasPrevious: true,
        }),
      )

    renderPage('/activities/a1')

    expect(await screen.findByText('Primeira página')).toBeInTheDocument()
    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Próxima' }))

    expect(await screen.findByText('Segunda página')).toBeInTheDocument()
    expect(screen.getByText('Página 2 de 2')).toBeInTheDocument()
    expect(listReviews).toHaveBeenLastCalledWith({ activityId: 'a1', page: 2, limit: 10 })
  })

  it('shows the not-found message when the API returns 404', async () => {
    vi.mocked(getActivityDetails).mockRejectedValue(ApiError.fromResponse(404))
    renderPage('/activities/00000000-0000-4000-8000-000000000000')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Atividade não encontrada' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Explorar destinos' })).toHaveAttribute(
      'href',
      '/destinations',
    )
    expect(listReviews).not.toHaveBeenCalled()
  })

  it('shows the not-found message when the id is invalid and the API returns 400', async () => {
    vi.mocked(getActivityDetails).mockRejectedValue(ApiError.fromResponse(400))
    renderPage('/activities/id-invalido')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Atividade não encontrada' }),
    ).toBeInTheDocument()
    expect(listReviews).not.toHaveBeenCalled()
  })

  it('shows the error state on server failure and retries on click', async () => {
    vi.mocked(getActivityDetails).mockRejectedValueOnce(ApiError.fromResponse(500))
    vi.mocked(listReviews).mockResolvedValue(makePaginatedReviews([]))

    renderPage('/activities/a1')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'O servidor está com problemas. Tente de novo em instantes.',
    )

    vi.mocked(getActivityDetails).mockResolvedValue(
      makeActivityDetails({ name: 'Museu do Louvre' }),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Museu do Louvre' }),
    ).toBeInTheDocument()
  })
})
