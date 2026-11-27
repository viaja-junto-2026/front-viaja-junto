import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MapPin } from 'lucide-react'
import { createMemoryRouter, MemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { makeActivity } from '../../test/activities'
import { makeDestination } from '../../test/destinations'
import { ExperienceCard } from '../activities/ExperienceCard'
import { CoverPhoto } from '../ui/CoverPhoto'
import { DestinationSearchBar } from './DestinationSearchBar'
import { DestinationShowcaseCard } from './DestinationShowcaseCard'

function renderSearchBar() {
  const router = createMemoryRouter([
    { path: '/', element: <DestinationSearchBar /> },
    { path: '*', element: <p>catálogo</p> },
  ])
  render(<RouterProvider router={router} />)
  return router
}

describe('DestinationSearchBar', () => {
  it('goes to the catalog without filters when nothing is filled in', async () => {
    const router = renderSearchBar()

    await userEvent.click(screen.getByRole('button', { name: 'Buscar destinos' }))

    expect(router.state.location.pathname).toBe('/destinations')
    expect(router.state.location.search).toBe('')
  })

  it('sends the text and the category in the URL', async () => {
    const router = renderSearchBar()

    await userEvent.type(screen.getByRole('searchbox', { name: 'Para onde?' }), '  Rio  ')
    await userEvent.click(screen.getByRole('combobox', { name: 'Tipo de destino' }))
    await userEvent.click(screen.getByRole('option', { name: 'Praia' }))
    await userEvent.click(screen.getByRole('button', { name: 'Buscar destinos' }))

    expect(router.state.location.search).toBe('?q=Rio&category=BEACH')
  })

  it('uses white labels over the dark bar', () => {
    renderSearchBar()

    expect(screen.getByText('Para onde?')).toHaveClass('text-white')
    expect(screen.getByText('Tipo de destino')).toHaveClass('text-white')
  })
})

describe('DestinationShowcaseCard', () => {
  function renderCard(overrides = {}) {
    return render(
      <MemoryRouter>
        <DestinationShowcaseCard destination={makeDestination(overrides)} />
      </MemoryRouter>,
    )
  }

  it('shows name, country, summary, rating and the details link', () => {
    renderCard({ id: 'abc', reviewCount: 12 })

    expect(screen.getByRole('heading', { name: 'Kyoto' })).toBeInTheDocument()
    expect(screen.getByText('Japão')).toBeInTheDocument()
    expect(screen.getByText('Antiga capital imperial.')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Nota 4,8 de 5' })).toBeInTheDocument()
    expect(screen.getByText('(12 avaliações)')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver detalhes de Kyoto' })).toHaveAttribute(
      'href',
      '/destinations/abc',
    )
  })

  it('uses the singular for one review', () => {
    renderCard({ reviewCount: 1 })

    expect(screen.getByText('(1 avaliação)')).toBeInTheDocument()
  })

  it('omits what the destination does not have', () => {
    renderCard({ country: null, description: null, averageRating: null })

    expect(screen.queryByText('Japão')).not.toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /Nota/ })).not.toBeInTheDocument()
  })
})

describe('ExperienceCard', () => {
  function renderCard(overrides = {}) {
    return render(
      <MemoryRouter>
        <ExperienceCard activity={makeActivity(overrides)} />
      </MemoryRouter>,
    )
  }

  it('leads to the activity with its translated type and city', () => {
    renderCard({ id: 'x1' })

    const link = screen.getByRole('link', { name: /Museu do Louvre/ })
    expect(link).toHaveAttribute('href', '/activities/x1')
    expect(link).toHaveTextContent('Passeio · Paris')
  })

  it.each([
    ['FOOD', '.lucide-utensils'],
    ['LODGING', '.lucide-bed-double'],
    ['TRANSPORT', '.lucide-bus'],
    ['OTHER', '.lucide-map-pin'],
  ] as const)('shows the icon of the %s type', (type, selector) => {
    const { container } = renderCard({ type, city: null })

    expect(container.querySelector(selector)).toBeInTheDocument()
  })
})

describe('CoverPhoto', () => {
  it('shows the photo and falls back to the icon when it fails', () => {
    const { container } = render(<CoverPhoto src="https://img.test/a.jpg" fallbackIcon={MapPin} />)

    fireEvent.error(container.querySelector('img') as HTMLImageElement)

    expect(container.querySelector('img')).not.toBeInTheDocument()
    expect(container.querySelector('.lucide-map-pin')).toBeInTheDocument()
  })

  it('shows the icon when there is no photo', () => {
    const { container } = render(<CoverPhoto src={null} fallbackIcon={MapPin} />)

    expect(container.querySelector('.lucide-map-pin')).toBeInTheDocument()
  })
})
