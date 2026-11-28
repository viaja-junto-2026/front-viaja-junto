import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../auth/authContext'
import { ApiError } from '../services/apiError'
import { joinTrip } from '../services/invites'
import { listTrips } from '../services/trips'
import { makeAuthValue } from '../test/auth'
import { createTestQueryClient } from '../test/query'
import { makePaginatedTrips, makeTrip } from '../test/trips'
import JoinTripPage from './JoinTripPage'
import TripsPage from './TripsPage'

vi.mock('../services/invites', () => ({ joinTrip: vi.fn() }))
vi.mock('../services/trips', () => ({ listTrips: vi.fn() }))

function renderAt(path: '/join' | '/trips') {
  const router = createMemoryRouter(
    [
      { path: '/join', element: <JoinTripPage /> },
      { path: '/trips', element: <TripsPage /> },
      { path: '/trips/:id', element: <p>página da viagem</p> },
    ],
    { initialEntries: [path] },
  )
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <AuthContext.Provider value={makeAuthValue()}>
        <RouterProvider router={router} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
  return router
}

const field = () => screen.getByLabelText('Código de convite')
const enter = () => userEvent.click(screen.getByRole('button', { name: 'Entrar na viagem' }))

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(listTrips).mockResolvedValue(makePaginatedTrips([]))
})

describe('JoinTripPage', () => {
  it('cleans the pasted code, joins and opens the trip', async () => {
    vi.mocked(joinTrip).mockResolvedValue(makeTrip({ id: 'abc', role: 'VIEWER' }))
    const router = renderAt('/join')

    await userEvent.type(field(), ' k7m2 qx9p ')
    expect(field()).toHaveValue('K7M2QX9P')
    await enter()

    await waitFor(() => expect(router.state.location.pathname).toBe('/trips/abc'))
    expect(vi.mocked(joinTrip).mock.calls[0][0]).toBe('K7M2QX9P')
  })

  it.each([
    ['', 'Informe o código de convite.'],
    ['abc', 'O código tem 8 letras e números.'],
    ['K7M2QX90', /não usa as letras/],
  ])('does not send "%s"', async (code, message) => {
    renderAt('/join')
    if (code) await userEvent.type(field(), code)

    await enter()

    expect(screen.getByText(message)).toBeInTheDocument()
    expect(field()).toHaveAttribute('aria-invalid', 'true')
    expect(joinTrip).not.toHaveBeenCalled()
  })

  it.each([
    [404, /Nenhuma viagem usa esse código/],
    [409, /Você já participa desta viagem/],
    [422, /Confira o código: são 8 letras/],
  ])('explains a %i on the field', async (status, message) => {
    vi.mocked(joinTrip).mockRejectedValue(ApiError.fromResponse(status))
    renderAt('/join')
    await userEvent.type(field(), 'K7M2QX9P')

    await enter()

    expect(await screen.findByText(message)).toBeInTheDocument()
    expect(field()).toHaveAttribute('aria-invalid', 'true')

    await userEvent.type(field(), '{Backspace}')
    expect(screen.queryByText(message)).not.toBeInTheDocument()
  })

  it.each([
    [429, 'Muitas tentativas seguidas.'],
    [500, 'O servidor está com problemas.'],
  ])('shows a %i as a general alert', async (status, message) => {
    vi.mocked(joinTrip).mockRejectedValue(ApiError.fromResponse(status))
    renderAt('/join')
    await userEvent.type(field(), 'K7M2QX9P')

    await enter()

    expect(await screen.findByRole('alert')).toHaveTextContent(message)
    expect(field()).not.toHaveAttribute('aria-invalid')
  })
})

describe('JoinTripDialog on my trips', () => {
  it('opens as a modal, can be closed and joins a trip', async () => {
    vi.mocked(joinTrip).mockResolvedValue(makeTrip({ id: 'abc', role: 'VIEWER' }))
    const router = renderAt('/trips')
    const open = () => userEvent.click(screen.getByRole('button', { name: 'Entrar com código' }))

    await open()
    const modal = screen.getByRole('dialog', { name: 'Entrar com código' })
    expect(modal).toHaveAttribute('aria-modal', 'true')
    await userEvent.click(within(modal).getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await open()
    await userEvent.type(field(), 'K7M2QX9P')
    await enter()

    await waitFor(() => expect(router.state.location.pathname).toBe('/trips/abc'))
    expect(document.body.style.overflow).toBe('')
  })
})
