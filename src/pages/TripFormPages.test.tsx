import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../auth/authContext'
import { ApiError } from '../services/apiError'
import { createTrip, deleteTrip, getTrip, updateTrip } from '../services/trips'
import { makeAuthValue } from '../test/auth'
import { createTestQueryClient } from '../test/query'
import { makeTrip } from '../test/trips'
import TripCreatePage from './TripCreatePage'
import TripEditPage from './TripEditPage'

vi.mock('../services/trips', () => ({
  createTrip: vi.fn(),
  getTrip: vi.fn(),
  updateTrip: vi.fn(),
  deleteTrip: vi.fn(),
}))

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      { path: '/trips', element: <p>lista de viagens</p> },
      { path: '/trips/new', element: <TripCreatePage /> },
      { path: '/trips/:id', element: <p>detalhe da viagem</p> },
      { path: '/trips/:id/edit', element: <TripEditPage /> },
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

const savedTrip = makeTrip({
  id: 'abc',
  startDate: '2027-07-01T00:00:00.000Z',
  endDate: '2027-07-15T00:00:00.000Z',
})

describe('TripCreatePage', () => {
  beforeEach(() => {
    vi.mocked(createTrip).mockReset()
  })

  it('creates the trip and goes to its page', async () => {
    vi.mocked(createTrip).mockResolvedValue(makeTrip({ id: 'new-id' }))
    const router = renderAt('/trips/new')

    await userEvent.type(screen.getByLabelText('Nome da viagem'), 'Floripa')
    await userEvent.click(screen.getByRole('button', { name: 'Criar viagem' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/trips/new-id'))
    expect(vi.mocked(createTrip).mock.calls[0][0]).toMatchObject({
      name: 'Floripa',
      status: 'PLANNING',
      currency: 'BRL',
    })
  })

  it('stays on the form and shows the 422 error on its field', async () => {
    vi.mocked(createTrip).mockRejectedValue(
      ApiError.fromResponse(422, { message: ['name should not be empty'] }),
    )
    const router = renderAt('/trips/new')

    await userEvent.type(screen.getByLabelText('Nome da viagem'), 'Floripa')
    await userEvent.click(screen.getByRole('button', { name: 'Criar viagem' }))

    expect(await screen.findByText('Este campo não pode ficar vazio.')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/trips/new')
  })

  it('shows the save button as loading while sending', async () => {
    vi.mocked(createTrip).mockReturnValue(new Promise(() => {}))
    renderAt('/trips/new')

    await userEvent.type(screen.getByLabelText('Nome da viagem'), 'Floripa')
    await userEvent.click(screen.getByRole('button', { name: 'Criar viagem' }))

    expect(screen.getByRole('button', { name: 'Criar viagem' })).toBeDisabled()
  })
})

describe('TripEditPage', () => {
  beforeEach(() => {
    vi.mocked(getTrip).mockReset()
    vi.mocked(updateTrip).mockReset()
    vi.mocked(deleteTrip).mockReset()
  })

  it('shows a loading skeleton while opening', () => {
    vi.mocked(getTrip).mockReturnValue(new Promise(() => {}))
    renderAt('/trips/abc/edit')

    expect(screen.getByRole('status')).toHaveTextContent('Carregando viagem')
  })

  it('fills the form, saves the changes and goes back to the list', async () => {
    vi.mocked(getTrip).mockResolvedValue(savedTrip)
    vi.mocked(updateTrip).mockResolvedValue(savedTrip)
    const router = renderAt('/trips/abc/edit')

    const name = await screen.findByLabelText('Nome da viagem')
    expect(name).toHaveValue('Eurotrip 2027')
    expect(screen.getByRole('combobox', { name: 'Data de início' })).toHaveTextContent(
      '1 jul. 2027',
    )

    await userEvent.click(screen.getByRole('combobox', { name: 'Data final' }))
    await userEvent.click(screen.getByRole('button', { name: 'Limpar' }))
    await userEvent.clear(name)
    await userEvent.type(name, 'Europa')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/trips'))
    expect(updateTrip).toHaveBeenCalledWith(
      'abc',
      expect.objectContaining({ name: 'Europa', startDate: '2027-07-01', endDate: null }),
    )
  })

  it('deletes only after the confirmation and goes back to the list', async () => {
    vi.mocked(getTrip).mockResolvedValue(savedTrip)
    vi.mocked(deleteTrip).mockResolvedValue(undefined)
    const router = renderAt('/trips/abc/edit')

    await userEvent.click(await screen.findByRole('button', { name: 'Excluir viagem' }))
    expect(deleteTrip).not.toHaveBeenCalled()

    const dialog = screen.getByRole('dialog', { name: 'Excluir esta viagem?' })
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Excluir viagem' }))
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Excluir' }),
    )

    await waitFor(() => expect(router.state.location.pathname).toBe('/trips'))
    expect(deleteTrip).toHaveBeenCalledWith('abc')
    expect(getTrip).toHaveBeenCalledTimes(1)
  })

  it('keeps the dialog open and explains a 403 on delete', async () => {
    vi.mocked(getTrip).mockResolvedValue(savedTrip)
    vi.mocked(deleteTrip).mockRejectedValue(ApiError.fromResponse(403))
    renderAt('/trips/abc/edit')

    await userEvent.click(await screen.findByRole('button', { name: 'Excluir viagem' }))
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Excluir' }),
    )

    expect(await within(screen.getByRole('dialog')).findByRole('alert')).toHaveTextContent(
      'Você não tem permissão para fazer isso.',
    )
  })

  it.each(['EDITOR', 'VIEWER'] as const)('hides the form and delete from a %s', async (role) => {
    vi.mocked(getTrip).mockResolvedValue(makeTrip({ role }))
    renderAt('/trips/abc/edit')

    expect(
      await screen.findByRole('heading', { name: 'Só quem criou pode editar' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Excluir viagem' })).not.toBeInTheDocument()
  })

  it('treats a 403 when opening as no permission', async () => {
    vi.mocked(getTrip).mockRejectedValue(ApiError.fromResponse(403))
    renderAt('/trips/abc/edit')

    expect(
      await screen.findByRole('heading', { name: 'Só quem criou pode editar' }),
    ).toBeInTheDocument()
  })

  it('shows the not found message on 404', async () => {
    vi.mocked(getTrip).mockRejectedValue(ApiError.fromResponse(404))
    renderAt('/trips/abc/edit')

    expect(
      await screen.findByRole('heading', { name: 'Viagem não encontrada' }),
    ).toBeInTheDocument()
  })

  it('shows the error and retries', async () => {
    vi.mocked(getTrip).mockRejectedValueOnce(ApiError.fromResponse(500))
    renderAt('/trips/abc/edit')
    await screen.findByRole('alert')

    vi.mocked(getTrip).mockResolvedValue(savedTrip)
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))

    expect(await screen.findByLabelText('Nome da viagem')).toHaveValue('Eurotrip 2027')
  })
})
