import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

// A home busca destinos e atividades: neste teste as listas vêm vazias.
vi.mock('./services/destinations', () => ({
  listTopDestinations: vi.fn().mockResolvedValue([]),
}))
vi.mock('./services/activities', () => ({
  listActivities: vi.fn().mockResolvedValue({
    data: [],
    meta: { page: 1, limit: 4, total: 0, totalPages: 0, hasNext: false, hasPrevious: false },
  }),
}))

describe('App', () => {
  it('renders the home page inside the app layout for a visitor', () => {
    render(<App />)

    expect(screen.getByRole('link', { name: /viajajunto, ir para/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Sua viagem começa aqui.' })).toBeInTheDocument()
    expect(within(screen.getByRole('banner')).getByRole('link', { name: 'Entrar' })).toBeVisible()
  })
})
