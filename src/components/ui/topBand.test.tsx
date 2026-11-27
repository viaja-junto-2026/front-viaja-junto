import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BandOverlap } from './BandOverlap'
import { CurvedEdge } from './CurvedEdge'
import { FilterPanel } from './FilterPanel'
import { FlightRoute } from './FlightRoute'
import { TicketCard } from './TicketCard'

describe('FilterPanel', () => {
  it('is the same brown box as the home search', () => {
    render(<FilterPanel>filtros</FilterPanel>)

    expect(screen.getByText('filtros')).toHaveClass('bg-brown-espresso')
  })
})

describe('TicketCard', () => {
  it('splits the content and the stub with a decorative perforation and no dark top border', () => {
    const { container } = render(<TicketCard stub="canhoto">bilhete</TicketCard>)

    expect(screen.getByText('bilhete')).toBeInTheDocument()
    expect(screen.getByText('canhoto')).toBeInTheDocument()
    expect(container.querySelector('[aria-hidden="true"] .border-dashed')).toBeInTheDocument()
    expect(container.firstChild).not.toHaveClass('border-t-4')
    // a sombra segue o contorno, para os furos também terem sombra
    expect(container.firstChild).toHaveClass('drop-shadow-ticket')
    expect(container.querySelectorAll('svg')).toHaveLength(2)
  })
})

describe('FlightRoute', () => {
  it('is a decorative route with a small mobile version and a wide desktop one', () => {
    const { container } = render(<FlightRoute />)
    const sides = container.querySelectorAll('[aria-hidden="true"] > svg')

    expect(sides).toHaveLength(4)
    expect([...sides].filter((side) => side.classList.contains('lg:hidden'))).toHaveLength(2)
    expect([...sides].filter((side) => side.classList.contains('lg:block'))).toHaveLength(2)
  })
})

describe('CurvedEdge', () => {
  it('is a decorative curve that ends in the page background color', () => {
    const { container } = render(<CurvedEdge />)

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelectorAll('path')).toHaveLength(2)
    expect(container.querySelector('path:last-child')).toHaveClass('fill-beige-light')
  })
})

describe('BandOverlap', () => {
  it('keeps the end of the band behind the top half of its content', () => {
    const { container } = render(<BandOverlap>filtros</BandOverlap>)
    const band = container.querySelector('[aria-hidden="true"]')

    expect(band).toHaveClass('-top-px', 'bottom-1/2', 'bg-white')
    expect(screen.getByText('filtros')).toBeInTheDocument()
  })
})
