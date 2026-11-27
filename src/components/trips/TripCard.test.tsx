import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import type { Trip } from '../../services/trips'
import { makeTrip } from '../../test/trips'
import { TripCard } from './TripCard'
import { TripStatusBadge } from './TripStatusBadge'

function renderCard(overrides: Partial<Trip> = {}) {
  return render(
    <MemoryRouter>
      <TripCard trip={makeTrip(overrides)} />
    </MemoryRouter>,
  )
}

describe('TripCard', () => {
  it.each<[Partial<Trip>, string]>([
    [{ startDate: '2027-07-01', endDate: null }, 'A partir de 1 jul. 2027'],
    [{ startDate: null, endDate: '2027-07-15' }, 'Até 15 jul. 2027'],
    [{ startDate: null, endDate: null }, 'Datas a definir'],
  ])('handles missing dates: %j', (dates, text) => {
    renderCard(dates)

    expect(screen.getByText(text)).toBeInTheDocument()
  })

  it('has no description paragraph when the trip has none', () => {
    renderCard({ description: null })

    expect(screen.queryByText('Duas semanas pela Europa.')).not.toBeInTheDocument()
  })
})

describe('TripStatusBadge', () => {
  it.each([
    ['PLANNING', 'Planejando', 'bg-blue-mist'],
    ['CONFIRMED', 'Confirmada', 'bg-green-mint'],
    ['COMPLETED', 'Concluída', 'bg-beige-sand'],
  ] as const)('shows icon, text and color for %s', (status, label, color) => {
    const { container } = render(<TripStatusBadge status={status} />)

    expect(screen.getByText(label)).toHaveClass(color, 'uppercase')
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })
})
