import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

// A home busca os destinos mais bem avaliados: neste teste a lista vem vazia.
vi.mock('./services/destinations', () => ({
  listTopDestinations: vi.fn().mockResolvedValue([]),
}))

describe('App', () => {
  it('renders the home page inside the app layout for a visitor', () => {
    render(<App />)

    expect(screen.getByRole('link', { name: /viajajunto/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Sua viagem começa aqui.' })).toBeInTheDocument()
    expect(within(screen.getByRole('banner')).getByRole('link', { name: 'Entrar' })).toBeVisible()
  })
})
