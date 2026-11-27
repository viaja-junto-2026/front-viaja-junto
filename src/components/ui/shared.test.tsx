import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MapPin } from 'lucide-react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { formatReviewCount } from '../../utils/format'
import { ApiError, isNotFoundError } from '../../services/apiError'
import { BrandLogo } from '../layout/BrandLogo'
import { BackLink } from './BackLink'
import { CoverPhoto } from './CoverPhoto'
import { ExternalTextLink } from './ExternalTextLink'
import { FilterPanel } from './FilterPanel'
import { Input } from './Input'
import { PageMessage } from './PageMessage'
import { Pagination } from './Pagination'
import { Tag } from './Tag'

describe('Pagination', () => {
  const base = { label: 'Paginação', page: 2, totalPages: 3, hasPrevious: true, hasNext: true }

  it('shows the position and moves between pages', async () => {
    const onPageChange = vi.fn()
    render(<Pagination {...base} onPageChange={onPageChange} />)

    expect(screen.getByRole('navigation', { name: 'Paginação' })).toHaveTextContent('Página 2 de 3')
    await userEvent.click(screen.getByRole('button', { name: 'Anterior' }))
    await userEvent.click(screen.getByRole('button', { name: 'Próxima' }))

    expect(onPageChange.mock.calls).toEqual([[1], [3]])
  })

  it('blocks the buttons while busy and at the edges', () => {
    const { rerender } = render(<Pagination {...base} busy onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Próxima' })).toBeDisabled()

    rerender(
      <Pagination {...base} totalPages={undefined} hasPrevious={false} onPageChange={() => {}} />,
    )
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Próxima' })).toBeEnabled()
    expect(screen.getByRole('navigation')).not.toHaveTextContent(' de ')
  })

  it('does not appear with a single page', () => {
    render(
      <Pagination
        {...base}
        page={1}
        totalPages={1}
        hasPrevious={false}
        hasNext={false}
        onPageChange={() => {}}
      />,
    )

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})

describe('PageMessage', () => {
  it('shows a page heading, the explanation and the way out', () => {
    render(
      <PageMessage
        icon={MapPin}
        title="Não encontrado"
        description="Confira o endereço."
        action={<button type="button">Voltar</button>}
      />,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Não encontrado' })).toBeInTheDocument()
    expect(screen.getByText('Confira o endereço.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Voltar' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('can be announced as an alert', () => {
    render(<PageMessage alert icon={MapPin} title="Erro" description="x" action={null} />)

    expect(screen.getByRole('alert')).toHaveTextContent('Erro')
  })
})

describe('links', () => {
  it('BackLink points back with an arrow', () => {
    const { container } = render(
      <MemoryRouter>
        <BackLink to="/destinations">Explorar destinos</BackLink>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Explorar destinos' })).toHaveAttribute(
      'href',
      '/destinations',
    )
    expect(container.querySelector('.lucide-arrow-left')).toBeInTheDocument()
  })

  it('ExternalTextLink opens safely in a new tab', () => {
    render(<ExternalTextLink href="https://maps.test">Ver no mapa</ExternalTextLink>)

    const link = screen.getByRole('link', { name: 'Ver no mapa' })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})

describe('Tag, FilterPanel and BrandLogo', () => {
  it('renders the tag text', () => {
    render(<Tag>Praia</Tag>)

    expect(screen.getByText('Praia')).toHaveClass('rounded-xs', 'uppercase')
  })

  it('renders the filters inside a square panel', () => {
    render(<FilterPanel>filtros</FilterPanel>)

    expect(screen.getByText('filtros')).toHaveClass('rounded-xs')
  })

  it('keeps the form fields square, like the buttons', () => {
    render(<Input label="Nome" />)

    expect(screen.getByLabelText('Nome')).toHaveClass('rounded-xs')
  })

  it('shows the logo in two sizes', () => {
    const { rerender } = render(<BrandLogo />)
    expect(screen.getByRole('img', { name: 'ViajaJunto' })).toHaveClass('h-12')

    rerender(<BrandLogo size="md" />)
    expect(screen.getByRole('img', { name: 'ViajaJunto' })).toHaveClass('h-10')
  })
})

describe('CoverPhoto', () => {
  it.each([
    ['landscape', 'aspect-4/3'],
    ['video', 'aspect-video'],
    ['header', 'lg:aspect-4/3'],
  ] as const)('applies the %s ratio', (ratio, expectedClass) => {
    const { container } = render(<CoverPhoto src={null} fallbackIcon={MapPin} ratio={ratio} />)

    expect(container.firstChild).toHaveClass(expectedClass)
  })

  it('accepts a description, eager loading and falls back on failure', () => {
    const { container } = render(
      <CoverPhoto src="https://img.test/a.jpg" alt="Paris" loading="eager" fallbackIcon={MapPin} />,
    )
    const photo = screen.getByRole('img', { name: 'Paris' })
    expect(photo).toHaveAttribute('loading', 'eager')

    fireEvent.error(photo)

    expect(container.querySelector('.lucide-map-pin')).toBeInTheDocument()
  })
})

describe('shared helpers', () => {
  it('formats the review count', () => {
    expect(formatReviewCount(1)).toBe('1 avaliação')
    expect(formatReviewCount(0)).toBe('0 avaliações')
    expect(formatReviewCount(12)).toBe('12 avaliações')
  })

  it('tells when an error means "not found"', () => {
    expect(isNotFoundError(ApiError.fromResponse(404))).toBe(true)
    expect(isNotFoundError(ApiError.fromResponse(400))).toBe(true)
    expect(isNotFoundError(ApiError.fromResponse(500))).toBe(false)
    expect(isNotFoundError(new Error('x'))).toBe(false)
  })
})
