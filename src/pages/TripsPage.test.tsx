import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../auth/authContext'
import { ApiError } from '../services/apiError'
import { listTrips } from '../services/trips'
import { makeAuthValue } from '../test/auth'
import { createTestQueryClient } from '../test/query'
import { makePaginatedTrips, makeTrip } from '../test/trips'
import TripsPage from './TripsPage'

vi.mock('../services/trips', () => ({ listTrips: vi.fn() }))

function renderPage() {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <AuthContext.Provider value={makeAuthValue()}>
        <MemoryRouter>
          <TripsPage />
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
}

describe('TripsPage', () => {
  beforeEach(() => {
    vi.mocked(listTrips).mockReset()
  })

  it('links to the new trip and join pages', () => {
    vi.mocked(listTrips).mockReturnValue(new Promise(() => {}))
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'Minhas viagens' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Nova viagem' })).toHaveAttribute('href', '/trips/new')
    expect(screen.getByRole('link', { name: 'Entrar com código' })).toHaveAttribute('href', '/join')
  })

  it('shows a loading skeleton while fetching', () => {
    vi.mocked(listTrips).mockReturnValue(new Promise(() => {}))
    renderPage()

    expect(screen.getByRole('status')).toHaveTextContent('Carregando viagens')
  })

  it('shows each trip with name, dates, status and role, linking to its page', async () => {
    vi.mocked(listTrips).mockResolvedValue(
      makePaginatedTrips([makeTrip({ id: 'abc', status: 'CONFIRMED', role: 'EDITOR' })]),
    )
    renderPage()

    const list = await screen.findByRole('list', { name: 'Lista de viagens' })
    expect(within(list).getByRole('link', { name: 'Eurotrip 2027' })).toHaveAttribute(
      'href',
      '/trips/abc',
    )
    expect(list).toHaveTextContent('1 – 15 de jul. de 2027')
    expect(list).toHaveTextContent('Confirmada')
    expect(list).toHaveTextContent('Editor')
  })

  it('shows the empty state with the action to create the first trip', async () => {
    vi.mocked(listTrips).mockResolvedValue(makePaginatedTrips([]))
    renderPage()

    expect(
      await screen.findByRole('heading', {
        name: 'Você ainda não tem viagens. Crie a primeira!',
      }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Nova viagem' })).toHaveLength(2)
  })

  it('filters by status and offers to see all when nothing matches', async () => {
    vi.mocked(listTrips).mockImplementation(async ({ status } = {}) =>
      makePaginatedTrips(status === 'COMPLETED' ? [] : [makeTrip()]),
    )
    renderPage()
    await screen.findByRole('link', { name: 'Eurotrip 2027' })

    await userEvent.click(screen.getByRole('button', { name: /Concluída/ }))

    expect(
      await screen.findByRole('heading', { name: 'Nenhuma viagem com esse status' }),
    ).toBeInTheDocument()
    expect(listTrips).toHaveBeenCalledWith({ page: 1, limit: 9, status: 'COMPLETED' })

    await userEvent.click(screen.getByRole('button', { name: 'Ver todas' }))

    expect(await screen.findByRole('link', { name: 'Eurotrip 2027' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Todas/ })).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows how many trips there are in each status', async () => {
    const totals = { PLANNING: 2, CONFIRMED: 0, COMPLETED: 1 }
    vi.mocked(listTrips).mockImplementation(async ({ status } = {}) =>
      makePaginatedTrips([makeTrip()], { total: status ? totals[status] : 3 }),
    )
    renderPage()

    expect(await screen.findByRole('button', { name: /3\s*Todas/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /2\s*Planejando/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /0\s*Confirmada/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /1\s*Concluída/ })).toBeInTheDocument()
  })

  it('keeps the filter usable when the counts fail', async () => {
    vi.mocked(listTrips).mockImplementation(async ({ limit } = {}) => {
      if (limit === 1) throw ApiError.fromResponse(429)
      return makePaginatedTrips()
    })
    renderPage()

    expect(await screen.findByRole('link', { name: 'Eurotrip 2027' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /–\s*Todas/ })).toBeInTheDocument()
  })

  it('shows the error with a retry button that reloads', async () => {
    vi.mocked(listTrips).mockRejectedValue(ApiError.fromResponse(500))
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'O servidor está com problemas. Tente de novo em instantes.',
    )

    vi.mocked(listTrips).mockResolvedValue(makePaginatedTrips())
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))

    expect(await screen.findByRole('link', { name: 'Eurotrip 2027' })).toBeInTheDocument()
  })
})
