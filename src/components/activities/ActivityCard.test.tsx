import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { makeActivity } from '../../test/activities'
import { ActivityCard } from './ActivityCard'

describe('ActivityCard', () => {
  it('renders a link to the activity page with type, name, location, description, and rating', () => {
    render(
      <MemoryRouter>
        <ActivityCard
          activity={makeActivity({
            id: 'louvre',
            name: 'Museu do Louvre',
            type: 'TOUR',
            location: 'Rue de Rivoli, 75001',
            description: 'Maior museu de arte do mundo.',
            averageRating: 4.6,
            reviewCount: 12,
          })}
        />
      </MemoryRouter>,
    )

    const link = screen.getByRole('link', { name: /Museu do Louvre/ })
    expect(link).toHaveAttribute('href', '/activities/louvre')
    expect(screen.getByText('Passeio')).toBeInTheDocument()
    expect(screen.getByText('Rue de Rivoli, 75001')).toBeInTheDocument()
    expect(screen.getByText('Maior museu de arte do mundo.')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Nota 4,6 de 5' })).toHaveTextContent('4,6')
    expect(screen.getByText('(12 avaliações)')).toBeInTheDocument()
  })

  it('handles missing rating, singular review count, and photo load error', () => {
    const { container } = render(
      <MemoryRouter>
        <ActivityCard
          activity={makeActivity({
            photoUrl: 'https://img.test/broken.jpg',
            averageRating: null,
            reviewCount: 0,
            location: null,
            description: null,
          })}
        />
      </MemoryRouter>,
    )

    const img = container.querySelector('img')
    expect(img).not.toBeNull()
    fireEvent.error(img!)

    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByText('Sem avaliações')).toBeInTheDocument()
  })
})
