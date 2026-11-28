import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../auth/authContext'
import { getActivity } from '../services/activities'
import { ApiError } from '../services/apiError'
import { getBudgetSummary } from '../services/budgets'
import { getDestination } from '../services/destinations'
import { getInviteCode } from '../services/invites'
import { listTripActivities, listTripDestinations } from '../services/itinerary'
import { listTripMembers } from '../services/members'
import { getTrip } from '../services/trips'
import { getUserName } from '../services/users'
import { makeActivity } from '../test/activities'
import { makeAuthValue } from '../test/auth'
import { makeBudgetSummary } from '../test/budgets'
import { makeDestination } from '../test/destinations'
import { makeStop, makeTripActivity } from '../test/itinerary'
import { createTestQueryClient } from '../test/query'
import { makeTrip } from '../test/trips'
import TripDetailsPage from './TripDetailsPage'

vi.mock('../services/trips', () => ({ getTrip: vi.fn() }))
vi.mock('../services/budgets', () => ({ getBudgetSummary: vi.fn() }))
vi.mock('../services/invites', () => ({ getInviteCode: vi.fn() }))
vi.mock('../services/members', () => ({ listTripMembers: vi.fn() }))
vi.mock('../services/users', () => ({ getUserName: vi.fn() }))
vi.mock('../services/itinerary', () => ({
  listTripDestinations: vi.fn(),
  listTripActivities: vi.fn(),
}))
vi.mock('../services/destinations', () => ({ getDestination: vi.fn() }))
vi.mock('../services/activities', () => ({ getActivity: vi.fn() }))

function renderPage() {
  const router = createMemoryRouter([{ path: '/trips/:id', element: <TripDetailsPage /> }], {
    initialEntries: ['/trips/t1'],
  })
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <AuthContext.Provider value={makeAuthValue()}>
        <RouterProvider router={router} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
}

function mockRoute() {
  vi.mocked(listTripDestinations).mockResolvedValue([
    makeStop({ id: 's1', order: 0, destinationCatalogId: 'paris' }),
    makeStop({
      id: 's2',
      order: 1,
      destinationCatalogId: 'roma',
      arrival: null,
      departure: null,
      description: null,
    }),
  ])
  vi.mocked(listTripActivities).mockImplementation(async (stopId) =>
    stopId === 's1'
      ? [
          makeTripActivity({ id: 'late', dateTime: '2027-01-16T15:00:00.000Z' }),
          makeTripActivity({ id: 'early', dateTime: '2027-01-16T09:00:00.000Z' }),
        ]
      : [],
  )
  vi.mocked(getDestination).mockImplementation(async (id) =>
    makeDestination({ id, name: id === 'paris' ? 'Paris' : 'Roma' }),
  )
  vi.mocked(getActivity).mockResolvedValue(makeActivity({ id: 'louvre', name: 'Louvre' }))
}

const itinerary = () => screen.findByRole('list', { name: 'Destinos do roteiro' })

describe('TripDetailsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(getTrip).mockResolvedValue(makeTrip())
    mockRoute()
  })

  it('shows the trip summary with dates, nights, status, role and counts', async () => {
    renderPage()

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Eurotrip 2027' }),
    ).toBeInTheDocument()
    expect(screen.getByText('1 – 15 de jul. de 2027')).toBeInTheDocument()
    expect(screen.getByText('Planejando')).toBeInTheDocument()
    await itinerary()

    const summary = screen.getByLabelText('Resumo da viagem')
    expect(summary).toHaveTextContent('Noites14')
    expect(summary).toHaveTextContent('Destinos2')
    expect(summary).toHaveTextContent('Atividades2')
    expect(summary).toHaveTextContent('Seu papelCriador')
  })

  it('lists the stops in order with activities in chronological order', async () => {
    renderPage()
    await itinerary()

    expect(
      screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent),
    ).toEqual(['Parada 1: Paris', 'Parada 2: Roma'])
    expect(screen.getByText('4 noites')).toBeInTheDocument()
    expect(screen.getByText('Sábado, 16 de janeiro')).toBeInTheDocument()
    expect(screen.getAllByText(/^\d\d:\d\d$/).map((time) => time.textContent)).toEqual([
      '09:00',
      '15:00',
    ])
    expect(screen.getAllByRole('heading', { level: 5, name: 'Louvre' })).toHaveLength(2)
    expect(screen.getAllByRole('link', { name: 'Louvre' })[0]).toHaveAttribute(
      'href',
      '/activities/louvre',
    )
    expect(screen.getAllByText('Pendente')).toHaveLength(2)
    expect(screen.getAllByText(/R\$\s154,00 por pessoa/)).toHaveLength(2)
    expect(screen.getByText('Nenhuma atividade planejada neste destino.')).toBeInTheDocument()
    expect(screen.getByText('Datas a definir')).toBeInTheDocument()
  })

  it('copes with partial dates and activities without date, duration or cost', async () => {
    vi.mocked(listTripDestinations).mockResolvedValue([
      makeStop({ id: 's1', departure: null }),
      makeStop({ id: 's2', order: 1, arrival: null }),
    ])
    vi.mocked(listTripActivities).mockImplementation(async (stopId) =>
      stopId === 's1'
        ? [makeTripActivity({ dateTime: null, durationMinutes: null, expectedCost: null })]
        : [],
    )
    renderPage()
    await itinerary()

    expect(screen.getByText('Chegada em 15 jan. 2027')).toBeInTheDocument()
    expect(screen.getByText('Saída em 19 jan. 2027')).toBeInTheDocument()
    expect(screen.getByText('Sem data definida')).toBeInTheDocument()
    expect(screen.getByText('--:--')).toBeInTheDocument()
    expect(screen.queryByText(/por pessoa/)).not.toBeInTheDocument()
    expect(screen.queryByText('Duração:')).not.toBeInTheDocument()
  })

  it('has the three tabs, each one with its content', async () => {
    vi.mocked(getBudgetSummary).mockResolvedValue(makeBudgetSummary())
    vi.mocked(listTripMembers).mockResolvedValue([])
    vi.mocked(getUserName).mockResolvedValue('Ana Souza')
    vi.mocked(getInviteCode).mockResolvedValue('K7M2QX9P')
    renderPage()
    const tabs = within(await screen.findByRole('tablist', { name: 'Seções da viagem' }))
    expect(tabs.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'Roteiro',
      'Orçamento',
      'Membros',
    ])

    await userEvent.click(tabs.getByRole('tab', { name: 'Orçamento' }))
    expect(await screen.findByRole('region', { name: 'Resumo do orçamento' })).toBeInTheDocument()
    await userEvent.click(tabs.getByRole('tab', { name: 'Membros' }))
    expect(await screen.findByRole('region', { name: 'Membros' })).toHaveTextContent('Ana Souza')
  })

  it.each(['VIEWER', 'EDITOR'] as const)('shows no trip edit button to a %s', async (role) => {
    vi.mocked(getTrip).mockResolvedValue(makeTrip({ role }))
    renderPage()
    await itinerary()

    expect(screen.queryByRole('link', { name: 'Editar viagem' })).not.toBeInTheDocument()
  })

  it('lets the creator edit the trip', async () => {
    renderPage()

    expect(await screen.findByRole('link', { name: 'Editar viagem' })).toHaveAttribute(
      'href',
      '/trips/t1/edit',
    )
  })

  it('copes with a trip without dates and missing catalog items', async () => {
    vi.mocked(getTrip).mockResolvedValue(
      makeTrip({ startDate: null, endDate: null, description: null }),
    )
    vi.mocked(getDestination).mockRejectedValue(new Error('x'))
    vi.mocked(getActivity).mockRejectedValue(new Error('x'))
    renderPage()
    await itinerary()

    expect(screen.getByLabelText('Resumo da viagem')).toHaveTextContent('Noites–')
    expect(screen.getAllByRole('heading', { name: /Destino indisponível/ })).toHaveLength(2)
    expect(screen.getAllByRole('heading', { name: 'Atividade indisponível' })).toHaveLength(2)
  })

  it('shows the empty itinerary', async () => {
    vi.mocked(listTripDestinations).mockResolvedValue([])
    renderPage()

    expect(
      await screen.findByRole('heading', { name: /Esta viagem ainda não tem destinos/ }),
    ).toBeInTheDocument()
  })

  it('shows the itinerary error with retry, keeping the header', async () => {
    vi.mocked(listTripDestinations).mockRejectedValueOnce(ApiError.fromResponse(500))
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('O servidor está com problemas.')
    expect(screen.getByLabelText('Resumo da viagem')).toHaveTextContent('Destinos–')

    mockRoute()
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))

    expect(await itinerary()).toBeInTheDocument()
  })

  it('shows a loading skeleton while opening', () => {
    vi.mocked(getTrip).mockReturnValue(new Promise(() => {}))
    renderPage()

    expect(screen.getByRole('status')).toHaveTextContent('Carregando viagem')
  })

  it.each([
    [404, 'Viagem não encontrada'],
    [403, 'Você não participa desta viagem'],
  ])('explains a %i', async (status, title) => {
    vi.mocked(getTrip).mockRejectedValue(ApiError.fromResponse(status))
    renderPage()

    expect(await screen.findByRole('heading', { name: title })).toBeInTheDocument()
  })

  it('shows other trip errors with retry', async () => {
    vi.mocked(getTrip).mockRejectedValueOnce(ApiError.fromResponse(500))
    renderPage()
    await screen.findByRole('alert')

    vi.mocked(getTrip).mockResolvedValue(makeTrip())
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))

    expect(await screen.findByRole('heading', { name: 'Eurotrip 2027' })).toBeInTheDocument()
  })
})
