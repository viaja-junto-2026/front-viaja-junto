import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../auth/authContext'
import { getActivity, listActivities } from '../services/activities'
import { ApiError } from '../services/apiError'
import { getDestination, listDestinations } from '../services/destinations'
import {
  createTripActivity,
  createTripDestination,
  deleteTripActivity,
  deleteTripDestination,
  listTripActivities,
  listTripDestinations,
  reorderTripDestinations,
  updateTripActivity,
  updateTripDestination,
} from '../services/itinerary'
import { getTrip, type Trip } from '../services/trips'
import { makeActivity, makePaginatedActivities } from '../test/activities'
import { makeAuthValue } from '../test/auth'
import { makeDestination, makePaginatedDestinations } from '../test/destinations'
import { makeStop, makeTripActivity } from '../test/itinerary'
import { createTestQueryClient } from '../test/query'
import { makeTrip } from '../test/trips'
import TripDetailsPage from './TripDetailsPage'

vi.mock('../services/trips', () => ({ getTrip: vi.fn() }))
vi.mock('../services/itinerary', () => ({
  listTripDestinations: vi.fn(),
  listTripActivities: vi.fn(),
  createTripDestination: vi.fn(),
  updateTripDestination: vi.fn(),
  deleteTripDestination: vi.fn(),
  reorderTripDestinations: vi.fn(),
  createTripActivity: vi.fn(),
  updateTripActivity: vi.fn(),
  deleteTripActivity: vi.fn(),
}))
vi.mock('../services/destinations', () => ({ getDestination: vi.fn(), listDestinations: vi.fn() }))
vi.mock('../services/activities', () => ({ getActivity: vi.fn(), listActivities: vi.fn() }))

const trip = (overrides: Partial<Trip> = {}) =>
  makeTrip({
    startDate: '2027-01-15T00:00:00.000Z',
    endDate: '2027-01-28T00:00:00.000Z',
    ...overrides,
  })

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

const ready = () => screen.findByRole('list', { name: 'Destinos do roteiro' })
const dialog = (name: string | RegExp) => screen.getByRole('dialog', { name })
const click = (element: Element) => userEvent.click(element)
const button = (name: string | RegExp) => screen.getByRole('button', { name })
const closed = () => waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

/** Abre um campo de data dentro da janela e escolhe o dia pelo nome por extenso. */
async function pickDay(scope: HTMLElement, field: string, day: string) {
  await click(within(scope).getByRole('combobox', { name: field }))
  await click(within(scope).getByRole('button', { name: day }))
}

async function pickOption(scope: HTMLElement, field: string, option: string) {
  await click(within(scope).getByRole('combobox', { name: field }))
  await click(within(scope).getByRole('option', { name: option }))
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(getTrip).mockResolvedValue(trip())
  vi.mocked(listTripDestinations).mockResolvedValue([
    makeStop({ id: 's1', order: 0, destinationCatalogId: 'paris' }),
    makeStop({
      id: 's2',
      order: 1,
      destinationCatalogId: 'roma',
      arrival: '2027-01-19T00:00:00.000Z',
      departure: '2027-01-24T00:00:00.000Z',
    }),
  ])
  vi.mocked(listTripActivities).mockImplementation(async (id) =>
    id === 's1' ? [makeTripActivity()] : [],
  )
  vi.mocked(getDestination).mockImplementation(async (id) =>
    makeDestination({ id, name: id === 'paris' ? 'Paris' : 'Roma' }),
  )
  vi.mocked(getActivity).mockResolvedValue(makeActivity({ id: 'louvre', name: 'Louvre' }))
  vi.mocked(listDestinations).mockResolvedValue(
    makePaginatedDestinations([makeDestination({ id: 'kyoto', name: 'Kyoto', country: 'Japão' })]),
  )
  vi.mocked(listActivities).mockResolvedValue(
    makePaginatedActivities([makeActivity({ id: 'orsay', name: 'Museu d’Orsay' })]),
  )
})

describe('itinerary permissions', () => {
  it.each(['OWNER', 'EDITOR'] as const)('gives the edit actions to a %s', async (role) => {
    vi.mocked(getTrip).mockResolvedValue(trip({ role }))
    renderPage()
    await ready()

    expect(button('Adicionar destino')).toBeInTheDocument()
    expect(button('Editar Paris')).toBeInTheDocument()
    expect(button('Adicionar atividade em Paris')).toBeInTheDocument()
    expect(button('Editar atividade Louvre')).toBeInTheDocument()
  })

  it('shows a VIEWER the same screen without any edit button', async () => {
    vi.mocked(getTrip).mockResolvedValue(trip({ role: 'VIEWER' }))
    renderPage()
    await ready()

    expect(screen.getByRole('link', { name: 'Louvre' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Adicionar|Editar|Excluir|Mover/ })).toBeNull()
  })

  it('invites editors to add the first destination, but not viewers', async () => {
    vi.mocked(listTripDestinations).mockResolvedValue([])
    renderPage()

    expect(
      await screen.findByRole('heading', {
        name: 'Esta viagem ainda não tem destinos. Adicione o primeiro!',
      }),
    ).toBeInTheDocument()
    await click(button('Adicionar destino'))
    expect(dialog('Adicionar destino')).toBeInTheDocument()
  })
})

describe('destinations', () => {
  it('adds a destination from the catalog at the end of the route', async () => {
    vi.mocked(createTripDestination).mockResolvedValue(makeStop())
    renderPage()
    await ready()
    await click(button('Adicionar destino'))
    const modal = dialog('Adicionar destino')

    await click(within(modal).getByRole('button', { name: 'Adicionar' }))
    expect(within(modal).getByText('Escolha um destino da lista.')).toBeInTheDocument()

    await click(await within(modal).findByRole('button', { name: /Kyoto/ }))
    await pickDay(modal, 'Chegada', '24 de janeiro de 2027')
    await pickDay(modal, 'Saída', '28 de janeiro de 2027')
    await userEvent.type(within(modal).getByLabelText('Descrição'), ' Templos ')
    await click(within(modal).getByRole('button', { name: 'Adicionar' }))

    await closed()
    expect(createTripDestination).toHaveBeenCalledWith({
      tripId: 't1',
      destinationCatalogId: 'kyoto',
      order: 2,
      arrival: '2027-01-24',
      departure: '2027-01-28',
      description: 'Templos',
    })
    expect(listTripDestinations).toHaveBeenCalledTimes(2)
  })

  it('lets the person change the chosen destination and search again', async () => {
    renderPage()
    await ready()
    await click(button('Adicionar destino'))
    const modal = dialog('Adicionar destino')
    await click(await within(modal).findByRole('button', { name: /Kyoto/ }))

    await click(within(modal).getByRole('button', { name: 'Trocar' }))
    vi.mocked(listDestinations).mockResolvedValue(makePaginatedDestinations([]))
    await userEvent.type(within(modal).getByLabelText('Buscar destino no catálogo'), 'zzz{Enter}')

    expect(await within(modal).findByText(/Nada encontrado/)).toBeInTheDocument()
    expect(listDestinations).toHaveBeenLastCalledWith({ q: 'zzz', limit: 6 })
    expect(createTripDestination).not.toHaveBeenCalled()
  })

  it('shows the catalog search error with retry', async () => {
    vi.mocked(listDestinations).mockRejectedValueOnce(ApiError.fromResponse(500))
    renderPage()
    await ready()
    await click(button('Adicionar destino'))
    const modal = dialog('Adicionar destino')

    await click(await within(modal).findByRole('button', { name: 'Tentar de novo' }))

    expect(await within(modal).findByRole('button', { name: /Kyoto/ })).toBeInTheDocument()
  })

  it('edits a destination and shows the API date error on its field', async () => {
    vi.mocked(updateTripDestination).mockRejectedValueOnce(
      ApiError.fromResponse(422, {
        message: ['arrival must be within the trip dates (2027-01-15 to 2027-01-28)'],
      }),
    )
    renderPage()
    await ready()
    await click(button('Editar Paris'))
    const modal = dialog('Editar Paris')

    await click(within(modal).getByRole('button', { name: 'Salvar' }))
    expect(
      await within(modal).findByText('Este campo precisa estar dentro das datas da viagem.'),
    ).toBeInTheDocument()

    vi.mocked(updateTripDestination).mockResolvedValue(makeStop())
    await click(within(modal).getByRole('button', { name: 'Salvar' }))
    await closed()
    expect(updateTripDestination).toHaveBeenLastCalledWith('s1', {
      arrival: '2027-01-15',
      departure: '2027-01-19',
      description: 'Primeira parada.',
    })
  })

  it('deletes a destination only after the confirmation and releases the scroll', async () => {
    vi.mocked(deleteTripDestination).mockResolvedValue(undefined)
    renderPage()
    await ready()
    await click(button('Editar Paris'))
    await click(within(dialog('Editar Paris')).getByRole('button', { name: 'Excluir destino' }))

    const confirmation = dialog('Excluir este destino?')
    expect(confirmation).toHaveTextContent('Paris sai do roteiro junto com as atividades')
    expect(deleteTripDestination).not.toHaveBeenCalled()
    await click(within(confirmation).getByRole('button', { name: 'Excluir' }))

    await closed()
    expect(deleteTripDestination).toHaveBeenCalledWith('s1')
    expect(document.body.style.overflow).toBe('')
  })

  it('keeps the form when the deletion is cancelled and explains a 403', async () => {
    vi.mocked(deleteTripDestination).mockRejectedValue(ApiError.fromResponse(403))
    renderPage()
    await ready()
    await click(button('Editar Paris'))
    const modal = dialog('Editar Paris')
    await click(within(modal).getByRole('button', { name: 'Excluir destino' }))

    await click(within(dialog('Excluir este destino?')).getByRole('button', { name: 'Cancelar' }))
    expect(modal).toBeInTheDocument()

    await click(within(modal).getByRole('button', { name: 'Excluir destino' }))
    const confirmation = dialog('Excluir este destino?')
    await click(within(confirmation).getByRole('button', { name: 'Excluir' }))
    expect(await within(confirmation).findByRole('alert')).toHaveTextContent(
      'Você não tem permissão para fazer isso.',
    )
  })

  it('reorders the destinations with the arrows', async () => {
    vi.mocked(reorderTripDestinations).mockResolvedValue(undefined)
    renderPage()
    await ready()
    expect(button('Mover Paris para cima')).toBeDisabled()
    expect(button('Mover Roma para baixo')).toBeDisabled()

    await click(button('Mover Paris para baixo'))
    await waitFor(() => expect(reorderTripDestinations).toHaveBeenCalledWith('t1', ['s2', 's1']))
    await click(await screen.findByRole('button', { name: 'Mover Roma para cima' }))

    await waitFor(() => expect(reorderTripDestinations).toHaveBeenCalledTimes(2))
  })

  it('warns when the new order cannot be saved', async () => {
    vi.mocked(reorderTripDestinations).mockRejectedValue(ApiError.fromResponse(500))
    renderPage()
    await ready()

    await click(button('Mover Paris para baixo'))

    expect(await screen.findByRole('alert')).toHaveTextContent('O servidor está com problemas.')
  })
})

describe('activities', () => {
  it('adds an activity of the destination catalog with date, time, duration and cost', async () => {
    vi.mocked(createTripActivity).mockResolvedValue(makeTripActivity())
    renderPage()
    await ready()
    await click(button('Adicionar atividade em Paris'))
    const modal = dialog('Adicionar atividade em Paris')

    await click(within(modal).getByRole('button', { name: 'Adicionar' }))
    expect(within(modal).getByText('Escolha uma atividade da lista.')).toBeInTheDocument()

    await click(await within(modal).findByRole('button', { name: /Orsay/ }))
    expect(listActivities).toHaveBeenCalledWith({ destinationId: 'paris', q: undefined, limit: 6 })
    await pickDay(modal, 'Dia', '17 de janeiro de 2027')
    await pickOption(modal, 'Horário', '14:30')
    await userEvent.type(within(modal).getByLabelText('Duração: horas'), '2')
    await userEvent.type(within(modal).getByLabelText('Duração: minutos'), '15')
    await userEvent.type(within(modal).getByLabelText(/Custo esperado/), '1.250,50')
    await pickOption(modal, 'Status', 'Confirmada')
    await click(within(modal).getByRole('button', { name: 'Adicionar' }))

    await closed()
    expect(createTripActivity).toHaveBeenCalledWith({
      tripDestinationId: 's1',
      activityCatalogId: 'orsay',
      dateTime: '2027-01-17T14:30:00.000Z',
      durationMinutes: 135,
      expectedCost: 1250.5,
      status: 'CONFIRMED',
    })
  })

  it('edits an activity, clearing what was removed', async () => {
    vi.mocked(updateTripActivity).mockResolvedValue(makeTripActivity())
    renderPage()
    await ready()
    await click(button('Editar atividade Louvre'))
    const modal = dialog('Editar Louvre')
    expect(within(modal).getByLabelText('Duração: horas')).toHaveValue('3')
    expect(within(modal).getByLabelText(/Custo esperado/)).toHaveValue('154')

    await userEvent.clear(within(modal).getByLabelText('Duração: horas'))
    await userEvent.clear(within(modal).getByLabelText('Duração: minutos'))
    await userEvent.clear(within(modal).getByLabelText(/Custo esperado/))
    await click(within(modal).getByRole('button', { name: 'Salvar' }))

    await closed()
    expect(updateTripActivity).toHaveBeenCalledWith('a1', {
      dateTime: '2027-01-16T10:00:00.000Z',
      durationMinutes: null,
      expectedCost: null,
      status: 'PENDING',
    })
  })

  it('deletes an activity only after the confirmation', async () => {
    vi.mocked(deleteTripActivity).mockResolvedValue(undefined)
    renderPage()
    await ready()
    await click(button('Editar atividade Louvre'))
    await click(within(dialog('Editar Louvre')).getByRole('button', { name: 'Excluir atividade' }))
    expect(deleteTripActivity).not.toHaveBeenCalled()

    await click(within(dialog('Excluir esta atividade?')).getByRole('button', { name: 'Excluir' }))

    await closed()
    expect(deleteTripActivity).toHaveBeenCalledWith('a1')
  })

  it('closes the window on cancel without saving', async () => {
    renderPage()
    await ready()
    await click(button('Editar atividade Louvre'))

    await click(within(dialog('Editar Louvre')).getByRole('button', { name: 'Cancelar' }))

    await closed()
    expect(updateTripActivity).not.toHaveBeenCalled()
  })
})

describe('itinerary consistency', () => {
  /** Abre a janela de nova atividade em Paris já com um lugar, um dia e um horário. */
  async function fillActivity(place: RegExp, time: string) {
    await click(button('Adicionar atividade em Paris'))
    const modal = dialog('Adicionar atividade em Paris')
    await click(await within(modal).findByRole('button', { name: place }))
    await pickDay(modal, 'Dia', '16 de janeiro de 2027')
    await pickOption(modal, 'Horário', time)
    return modal
  }

  it('does not add the same place twice at the same day and time', async () => {
    vi.mocked(listActivities).mockResolvedValue(
      makePaginatedActivities([makeActivity({ id: 'louvre', name: 'Louvre' })]),
    )
    renderPage()
    await ready()
    const modal = await fillActivity(/Louvre/, '10:00')

    await click(within(modal).getByRole('button', { name: 'Adicionar' }))

    expect(
      within(modal).getByText(
        'Louvre já está no roteiro nesse dia e horário. Escolha outro horário.',
      ),
    ).toBeInTheDocument()
    expect(createTripActivity).not.toHaveBeenCalled()
  })

  it('warns about a time clash and still lets the person save', async () => {
    vi.mocked(createTripActivity).mockResolvedValue(makeTripActivity())
    renderPage()
    await ready()
    const modal = await fillActivity(/Orsay/, '11:00')

    expect(within(modal).getByText('Nesse horário já há: Louvre (10:00).')).toBeInTheDocument()
    await click(within(modal).getByRole('button', { name: 'Adicionar' }))

    await closed()
    expect(createTripActivity).toHaveBeenCalledTimes(1)
  })

  it('does not shorten a stay leaving an activity outside', async () => {
    renderPage()
    await ready()
    await click(button('Editar Paris'))
    const modal = dialog('Editar Paris')
    await pickDay(modal, 'Chegada', '17 de janeiro de 2027')

    await click(within(modal).getByRole('button', { name: 'Salvar' }))

    expect(within(modal).getByText(/ficariam fora do período: Louvre/)).toBeInTheDocument()
    expect(updateTripDestination).not.toHaveBeenCalled()
  })

  it('marks what is already inconsistent, also for viewers', async () => {
    vi.mocked(getTrip).mockResolvedValue(
      trip({ role: 'VIEWER', endDate: '2027-01-22T00:00:00.000Z' }),
    )
    vi.mocked(listTripActivities).mockImplementation(async (id) =>
      id === 's1' ? [makeTripActivity(), makeTripActivity({ id: 'a2' })] : [],
    )
    renderPage()
    await ready()

    expect(await screen.findAllByText('Repetida')).toHaveLength(2)
    expect(
      screen.getByText('Fora das datas da viagem. Ajuste a chegada ou a saída.'),
    ).toBeInTheDocument()
  })
})
