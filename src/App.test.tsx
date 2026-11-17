import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renderiza o título do projeto', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /viaja junto/i })).toBeInTheDocument()
  })
})
