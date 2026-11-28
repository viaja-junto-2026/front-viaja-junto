import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../auth/authContext'
import { ApiError } from '../services/apiError'
import { getInviteCode, regenerateInviteCode } from '../services/invites'
import { listTripMembers, removeTripMember, updateMemberPermission } from '../services/members'
import { getUserName } from '../services/users'
import { makeAuthValue, testUser } from '../test/auth'
import { makeMember } from '../test/members'
import { createTestQueryClient } from '../test/query'
import { makeTrip } from '../test/trips'
import type { MemberRole } from '../utils/labels'
import { MembersTab } from './trip/MembersTab'

vi.mock('../services/invites', () => ({
  getInviteCode: vi.fn(),
  regenerateInviteCode: vi.fn(),
  joinTrip: vi.fn(),
}))
vi.mock('../services/members', () => ({
  listTripMembers: vi.fn(),
  updateMemberPermission: vi.fn(),
  removeTripMember: vi.fn(),
}))
vi.mock('../services/users', () => ({ getUserName: vi.fn() }))

const names: Record<string, string> = { ana: 'Ana Souza', bia: 'Bia Lima' }

function renderTab(role: MemberRole = 'OWNER') {
  // `setup` instala uma área de transferência de teste.
  const user = userEvent.setup()
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <AuthContext.Provider value={makeAuthValue()}>
        <MembersTab trip={makeTrip({ id: 't1', createdBy: 'ana', role })} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
  return user
}

const people = () => screen.findByRole('list', { name: 'Pessoas da viagem' })
const invite = () => screen.getByRole('region', { name: 'Convite' })
const dialog = (name: string) => screen.getByRole('dialog', { name })
const button = (name: string) => screen.getByRole('button', { name })
const closed = () => waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(getInviteCode).mockResolvedValue('K7M2QX9P')
  vi.mocked(listTripMembers).mockResolvedValue([makeMember()])
  vi.mocked(getUserName).mockImplementation(async (id) => names[id] ?? id)
})

describe('members states', () => {
  it('shows a loading skeleton', () => {
    vi.mocked(listTripMembers).mockReturnValue(new Promise(() => {}))
    renderTab('VIEWER')

    expect(screen.getByRole('status')).toHaveTextContent('Carregando membros')
  })

  it.each([
    [500, 'O servidor está com problemas.'],
    [403, 'Você não tem acesso aos membros desta viagem.'],
  ])('shows a %i with retry', async (status, message) => {
    vi.mocked(listTripMembers).mockRejectedValueOnce(ApiError.fromResponse(status))
    const user = renderTab('VIEWER')
    expect(await screen.findByRole('alert')).toHaveTextContent(message)

    await user.click(button('Tentar de novo'))

    expect(await people()).toBeInTheDocument()
  })

  it.each([
    ['OWNER', 'Envie o código de convite'],
    ['VIEWER', 'Quem entrar com o código'],
  ] as const)('says nobody joined yet to a %s', async (role, hint) => {
    vi.mocked(listTripMembers).mockResolvedValue([])
    renderTab(role)

    expect(await screen.findByRole('heading', { name: 'Ninguém entrou ainda' })).toBeInTheDocument()
    expect(screen.getByText(hint, { exact: false })).toBeInTheDocument()
    expect(within(await people()).getAllByRole('listitem')).toHaveLength(1)
  })
})

describe('members permissions', () => {
  it('lists each person with avatar, role and since when', async () => {
    renderTab('VIEWER')
    const [creator, member] = within(await people()).getAllByRole('listitem')

    expect(within(creator).getByRole('img', { name: 'Ana Souza' })).toBeInTheDocument()
    expect(creator).toHaveTextContent('Criou a viagem')
    expect(creator).toHaveTextContent('Criador')
    expect(member).toHaveTextContent('Bia Lima')
    expect(member).toHaveTextContent('Entrou em 20 out. 2026')
    expect(member).toHaveTextContent('Visualizador')
  })

  it.each(['VIEWER', 'EDITOR'] as const)('only shows the list to a %s', async (role) => {
    renderTab(role)
    await people()

    expect(screen.queryByRole('region', { name: 'Convite' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(getInviteCode).not.toHaveBeenCalled()
  })

  it('marks who is looking at the page', async () => {
    vi.mocked(listTripMembers).mockResolvedValue([makeMember({ userId: testUser.id })])
    renderTab('EDITOR')

    expect(within(await people()).getByText('(você)')).toBeInTheDocument()
  })

  it('gives the creator no controls over their own row', async () => {
    renderTab()
    const [creator, member] = within(await people()).getAllByRole('listitem')

    expect(within(creator).queryByRole('button')).not.toBeInTheDocument()
    expect(
      within(member).getByRole('combobox', { name: 'Permissão de Bia Lima' }),
    ).toHaveTextContent('Visualizador')
    expect(within(member).getByRole('button', { name: 'Remover Bia Lima' })).toBeInTheDocument()
  })
})

describe('invite code', () => {
  it('shows and copies the code', async () => {
    const user = renderTab()
    expect(await screen.findByText('K7M2QX9P')).toBeInTheDocument()

    await user.click(button('Copiar código'))

    expect(await within(invite()).findByText('Código copiado.')).toBeInTheDocument()
    await expect(navigator.clipboard.readText()).resolves.toBe('K7M2QX9P')
  })

  it('explains how to copy when the browser refuses', async () => {
    const user = renderTab()
    await screen.findByText('K7M2QX9P')
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'))

    await user.click(button('Copiar código'))

    expect(await within(invite()).findByText(/Não deu para copiar/)).toBeInTheDocument()
  })

  it('asks before generating a new code', async () => {
    vi.mocked(regenerateInviteCode).mockResolvedValue('ABCD2345')
    const user = renderTab()
    await screen.findByText('K7M2QX9P')

    await user.click(button('Gerar novo código'))
    expect(dialog('Gerar um novo código?')).toHaveTextContent('O código atual para de funcionar')
    expect(regenerateInviteCode).not.toHaveBeenCalled()
    await user.click(button('Gerar novo'))

    await closed()
    expect(regenerateInviteCode).toHaveBeenCalledWith('t1')
    expect(screen.getByText('ABCD2345')).toBeInTheDocument()
    expect(screen.queryByText('K7M2QX9P')).not.toBeInTheDocument()
  })

  it('keeps the old code and explains a failure, which cancel clears', async () => {
    vi.mocked(regenerateInviteCode).mockRejectedValue(ApiError.fromResponse(403))
    const user = renderTab()
    await screen.findByText('K7M2QX9P')
    await user.click(button('Gerar novo código'))
    await user.click(button('Gerar novo'))

    expect(await screen.findByRole('alert')).toHaveTextContent('Você não tem permissão')
    await user.click(button('Cancelar'))
    await user.click(button('Gerar novo código'))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText('K7M2QX9P')).toBeInTheDocument()
  })

  it('shows its own loading and error with retry', async () => {
    vi.mocked(getInviteCode).mockRejectedValueOnce(ApiError.fromResponse(500))
    const user = renderTab()
    await people()
    await within(invite()).findByRole('alert')

    await user.click(within(invite()).getByRole('button', { name: 'Tentar de novo' }))

    expect(await screen.findByText('K7M2QX9P')).toBeInTheDocument()
  })
})

describe('managing members', () => {
  it('changes the permission and reloads the list', async () => {
    vi.mocked(updateMemberPermission).mockResolvedValue(makeMember({ permission: 'EDITOR' }))
    const user = renderTab()
    await people()
    vi.mocked(listTripMembers).mockResolvedValue([makeMember({ permission: 'EDITOR' })])
    const field = screen.getByRole('combobox', { name: 'Permissão de Bia Lima' })

    await user.click(field)
    await user.click(screen.getByRole('option', { name: 'Editor' }))

    await waitFor(() => expect(listTripMembers).toHaveBeenCalledTimes(2))
    expect(updateMemberPermission).toHaveBeenCalledWith('m1', 'EDITOR')
    expect(field).toHaveTextContent('Editor')
  })

  it('sends nothing when the same permission is chosen', async () => {
    const user = renderTab()
    await people()

    await user.click(screen.getByRole('combobox', { name: 'Permissão de Bia Lima' }))
    await user.click(screen.getByRole('option', { name: 'Visualizador' }))

    expect(updateMemberPermission).not.toHaveBeenCalled()
  })

  it('keeps the old permission and explains a failed change', async () => {
    vi.mocked(updateMemberPermission).mockRejectedValue(ApiError.fromResponse(500))
    const user = renderTab()
    await people()
    const field = screen.getByRole('combobox', { name: 'Permissão de Bia Lima' })

    await user.click(field)
    await user.click(screen.getByRole('option', { name: 'Editor' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('O servidor está com problemas.')
    expect(field).toHaveTextContent('Visualizador')
  })

  it('removes a member only after the confirmation', async () => {
    vi.mocked(removeTripMember).mockResolvedValue(undefined)
    const user = renderTab()
    await people()

    await user.click(button('Remover Bia Lima'))
    expect(dialog('Remover da viagem?')).toHaveTextContent('Bia Lima perde o acesso')
    expect(removeTripMember).not.toHaveBeenCalled()
    vi.mocked(listTripMembers).mockResolvedValue([])
    await user.click(button('Remover'))

    await closed()
    expect(removeTripMember).toHaveBeenCalledWith('m1')
    expect(await screen.findByRole('heading', { name: 'Ninguém entrou ainda' })).toBeInTheDocument()
  })

  it('explains a failed removal and lets the creator give up', async () => {
    vi.mocked(removeTripMember).mockRejectedValue(ApiError.fromResponse(403))
    const user = renderTab()
    await people()
    await user.click(button('Remover Bia Lima'))
    await user.click(button('Remover'))
    expect(await screen.findByRole('alert')).toHaveTextContent('Você não tem permissão')

    await user.click(button('Cancelar'))

    await closed()
    expect(screen.getByText('Bia Lima')).toBeInTheDocument()
  })
})
