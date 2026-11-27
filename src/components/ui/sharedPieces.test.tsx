import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RatingSummary } from '../reviews/RatingSummary'
import { CompassDivider } from './CompassDivider'
import { DisplayTitle } from './DisplayTitle'
import { LocationLine } from './LocationLine'

describe('DisplayTitle', () => {
  it('is a brown serif page heading with the section size by default', () => {
    render(<DisplayTitle>Perfil</DisplayTitle>)

    expect(screen.getByRole('heading', { level: 1, name: 'Perfil' })).toHaveClass(
      'font-display',
      'text-brown-espresso',
      'text-headline-lg',
    )
  })

  it('accepts another heading level and the page size', () => {
    render(
      <DisplayTitle as="h2" size="page">
        Atividades
      </DisplayTitle>,
    )

    expect(screen.getByRole('heading', { level: 2 })).toHaveClass('text-display-hero-mobile')
  })
})

describe('LocationLine', () => {
  it('shows the place with a decorative pin', () => {
    const { container } = render(<LocationLine>Países Baixos</LocationLine>)

    expect(screen.getByText('Países Baixos')).toBeInTheDocument()
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('RatingSummary', () => {
  it('shows the stars and the number of reviews', () => {
    render(<RatingSummary rating={4.5} reviewCount={2} />)

    expect(screen.getByRole('img', { name: 'Nota 4,5 de 5' })).toBeInTheDocument()
    expect(screen.getByText(/2 avaliações/)).toBeInTheDocument()
  })

  it('says there is no rating yet', () => {
    render(<RatingSummary rating={null} reviewCount={0} />)

    expect(screen.getByText('Ainda sem nota média')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})

describe('CompassDivider', () => {
  it('is only decoration', () => {
    const { container } = render(<CompassDivider />)

    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })
})
