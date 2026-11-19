import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { makeDestination } from '../../test/destinations'
import type { Destination } from '../../services/destinations'
import { DestinationCard } from './DestinationCard'

function renderCard(overrides: Partial<Destination> = {}, className?: string) {
  return render(
    <MemoryRouter>
      <DestinationCard destination={makeDestination(overrides)} className={className} />
    </MemoryRouter>,
  )
}

describe('DestinationCard', () => {
  it('is a link to the destination page with its name and country', () => {
    renderCard({ id: 'abc' })

    const card = screen.getByRole('link', { name: /Kyoto/ })
    expect(card).toHaveAttribute('href', '/destinations/abc')
    expect(card).toHaveTextContent('Japão')
  })

  it('shows the photo, lazy loaded', () => {
    const { container } = renderCard()

    const photo = container.querySelector('img')
    expect(photo).toHaveAttribute('src', 'https://img.test/kyoto.jpg')
    expect(photo).toHaveAttribute('loading', 'lazy')
  })

  it('shows the rating in pt-BR with an accessible description', () => {
    renderCard({ averageRating: 4.5, reviewCount: 12 })

    expect(screen.getByRole('img', { name: 'Nota 4,5 de 5, 12 avaliações' })).toHaveTextContent(
      '4,5',
    )
  })

  it('uses the singular for a single review', () => {
    renderCard({ averageRating: 5, reviewCount: 1 })

    expect(screen.getByRole('img', { name: 'Nota 5,0 de 5, 1 avaliação' })).toBeInTheDocument()
  })

  it('hides the rating when there is none', () => {
    renderCard({ averageRating: null })

    expect(screen.queryByRole('img', { name: /Nota/ })).not.toBeInTheDocument()
  })

  it('hides the country when it is unknown', () => {
    renderCard({ country: null })

    expect(screen.getByRole('link', { name: /Kyoto/ })).not.toHaveTextContent('Japão')
  })

  it('shows the beige background with an icon when there is no photo', () => {
    const { container } = renderCard({ photoUrl: null })

    expect(container.querySelector('img')).not.toBeInTheDocument()
    expect(container.querySelector('.lucide-map-pin')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Kyoto/ })).toHaveClass('bg-beige-sand')
  })

  it('falls back to the icon when the photo fails to load', () => {
    const { container } = renderCard()

    fireEvent.error(container.querySelector('img') as HTMLImageElement)

    expect(container.querySelector('img')).not.toBeInTheDocument()
    expect(container.querySelector('.lucide-map-pin')).toBeInTheDocument()
  })

  it('accepts extra classes', () => {
    renderCard({}, 'w-64')

    expect(screen.getByRole('link', { name: /Kyoto/ })).toHaveClass('w-64')
  })
})
