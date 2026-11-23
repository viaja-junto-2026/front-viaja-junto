import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RatingStars } from './RatingStars'

describe('RatingStars', () => {
  it('renders an accessible label with the formatted rating', () => {
    render(<RatingStars rating={4.6} />)

    const stars = screen.getByRole('img', { name: 'Nota 4,6 de 5' })
    expect(stars).toBeInTheDocument()
    expect(stars.querySelectorAll('svg')).toHaveLength(5)
  })

  it('shows the numeric value when showValue is enabled', () => {
    render(<RatingStars rating={4.5} showValue size="sm" />)

    expect(screen.getByRole('img', { name: 'Nota 4,5 de 5' })).toHaveTextContent('4,5')
  })

  it('clamps out-of-range ratings between 0 and max', () => {
    const { rerender } = render(<RatingStars rating={7} max={5} />)
    expect(screen.getByRole('img', { name: 'Nota 5,0 de 5' })).toBeInTheDocument()

    rerender(<RatingStars rating={-2} max={5} />)
    expect(screen.getByRole('img', { name: 'Nota 0,0 de 5' })).toBeInTheDocument()
  })
})
