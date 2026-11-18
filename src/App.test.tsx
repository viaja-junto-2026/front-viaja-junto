import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the home page inside the app layout for a visitor', () => {
    render(<App />)

    expect(screen.getByRole('link', { name: /viajajunto/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Início' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Entrar' })).toBeInTheDocument()
  })
})
