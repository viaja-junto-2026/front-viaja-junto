import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../auth/authContext'
import { ApiError } from '../services/apiError'
import {
  createBudget,
  deleteBudget,
  findBudget,
  getBudgetSummary,
  updateBudget,
  type BudgetSummary,
} from '../services/budgets'
import { makeAuthValue } from '../test/auth'
import { makeBudget, makeBudgetSummary } from '../test/budgets'
import { createTestQueryClient } from '../test/query'
import { makeTrip } from '../test/trips'
import type { MemberRole } from '../utils/labels'
import { BudgetTab } from './trip/BudgetTab'

vi.mock('../services/budgets', () => ({
  getBudgetSummary: vi.fn(),
  findBudget: vi.fn(),
  createBudget: vi.fn(),
  updateBudget: vi.fn(),
  deleteBudget: vi.fn(),
}))

const noBudget = (overrides: Partial<BudgetSummary> = {}) =>
  makeBudgetSummary({ totalValue: null, remaining: null, ...overrides })

function renderTab(role: MemberRole = 'OWNER') {
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <AuthContext.Provider value={makeAuthValue()}>
        <BudgetTab trip={makeTrip({ id: 't1', role })} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
}

const summary = () => screen.findByRole('region', { name: 'Resumo do orçamento' })
const dialog = (name: string) => screen.getByRole('dialog', { name })
const closed = () => waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
const button = (name: string) => screen.getByRole('button', { name })
/** O texto com espaços comuns: a moeda e a porcentagem usam espaço sem quebra. */
const textOf = (element: Element) => element.textContent!.replace(/\u00a0/g, ' ')

async function typeTotal(modal: HTMLElement, value: string) {
  const field = within(modal).getByLabelText('Orçamento total (BRL)')
  await userEvent.clear(field)
  if (value) await userEvent.type(field, value)
  await userEvent.click(within(modal).getByRole('button', { name: 'Salvar' }))
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(getBudgetSummary).mockResolvedValue(makeBudgetSummary())
  vi.mocked(findBudget).mockResolvedValue(makeBudget())
})

describe('budget states', () => {
  it('shows a loading skeleton', () => {
    vi.mocked(getBudgetSummary).mockReturnValue(new Promise(() => {}))
    renderTab()

    expect(screen.getByRole('status')).toHaveTextContent('Carregando orçamento')
  })

  it('shows the error with retry', async () => {
    vi.mocked(getBudgetSummary).mockRejectedValueOnce(ApiError.fromResponse(500))
    renderTab()
    expect(await screen.findByRole('alert')).toHaveTextContent('O servidor está com problemas.')

    await userEvent.click(button('Tentar de novo'))

    expect(await summary()).toBeInTheDocument()
  })

  it('invites an editor to define the budget, telling what is already planned', async () => {
    vi.mocked(getBudgetSummary).mockResolvedValue(noBudget())
    renderTab('EDITOR')

    expect(
      await screen.findByRole('heading', { name: 'Defina o orçamento da viagem' }),
    ).toBeInTheDocument()
    expect(textOf(document.body)).toContain('As atividades planejadas já somam R$ 10.531,00.')
    expect(button('Definir orçamento')).toBeInTheDocument()
  })

  it('only informs a viewer that there is no budget', async () => {
    vi.mocked(getBudgetSummary).mockResolvedValue(noBudget({ planned: 0 }))
    renderTab('VIEWER')

    expect(
      await screen.findByRole('heading', { name: 'Esta viagem ainda não tem orçamento' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(textOf(document.body)).not.toContain('já somam')
  })
})

describe('budget summary', () => {
  it('shows total, planned, balance, usage and the five categories', async () => {
    renderTab()
    const card = await summary()

    expect(textOf(card)).toContain('TotalR$ 17.000,00')
    expect(textOf(card)).toContain('PlanejadoR$ 10.531,00')
    expect(textOf(card)).toContain('SaldoR$ 6.469,00')
    expect(textOf(card)).toContain('62 % do orçamento planejado')
    expect(
      within(card).getByRole('progressbar', { name: 'Orçamento comprometido' }),
    ).toHaveAttribute('aria-valuenow', '10531')
    expect(within(card).queryByText('Orçamento estourado')).not.toBeInTheDocument()

    const categories = within(
      screen.getByRole('region', { name: 'Consumo por categoria' }),
    ).getAllByRole('listitem')
    expect(categories.map(textOf)).toEqual([
      'PasseiosR$ 2.080,0012 atividades',
      'ComidaR$ 1.097,006 atividades',
      'HospedagemR$ 7.354,003 atividades',
      'TransporteR$ 0,00Nenhuma atividade',
      'OutrosR$ 0,00Nenhuma atividade',
    ])
  })

  it('warns how much went over and fills the bar', async () => {
    vi.mocked(getBudgetSummary).mockResolvedValue(
      makeBudgetSummary({ totalValue: 10500, remaining: -31, overBudget: true }),
    )
    renderTab()
    const card = await summary()

    expect(textOf(card)).toContain('Saldo-R$ 31,00')
    expect(textOf(card)).toContain('O planejado passou o total em R$ 31,00.')
    // 100,3 % nunca aparece como "100 %".
    expect(textOf(card)).toContain('101 % do orçamento planejado')
    const bar = within(card).getByRole('progressbar', { name: 'Orçamento comprometido' })
    expect(bar).toHaveAttribute('aria-valuenow', '1')
    expect(bar).toHaveAttribute('aria-valuemax', '1')
  })

  it('does not round up to 100 % while there is balance left', async () => {
    vi.mocked(getBudgetSummary).mockResolvedValue(
      makeBudgetSummary({ totalValue: 10532, remaining: 1 }),
    )
    renderTab()

    expect(textOf(await summary())).toContain('99 % do orçamento planejado')
  })

  it.each([
    [500, true, 'Tudo o que está planejado passa do orçamento.', '1'],
    [0, false, 'Nada planejado ainda.', '0'],
  ])('copes with a zero total and %i planned', async (planned, overBudget, text, now) => {
    vi.mocked(getBudgetSummary).mockResolvedValue(
      makeBudgetSummary({ totalValue: 0, planned, remaining: -planned, overBudget }),
    )
    renderTab()
    const card = await summary()

    expect(card).toHaveTextContent(text)
    expect(
      within(card).getByRole('progressbar', { name: 'Orçamento comprometido' }),
    ).toHaveAttribute('aria-valuenow', now)
  })

  it.each([
    [1, '1 atividade ainda está sem custo e não entra na conta.'],
    [3, '3 atividades ainda estão sem custo e não entram na conta.'],
  ])('mentions %i activities without cost', async (unpricedActivities, text) => {
    vi.mocked(getBudgetSummary).mockResolvedValue(makeBudgetSummary({ unpricedActivities }))
    renderTab()

    expect(await summary()).toHaveTextContent(text)
  })

  it('has no edit button for a viewer', async () => {
    renderTab('VIEWER')
    await summary()

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

describe('budget changes', () => {
  it('defines the budget and updates the summary', async () => {
    vi.mocked(getBudgetSummary).mockResolvedValueOnce(noBudget())
    vi.mocked(findBudget).mockResolvedValue(null)
    vi.mocked(createBudget).mockResolvedValue(makeBudget())
    renderTab()
    await userEvent.click(await screen.findByRole('button', { name: 'Definir orçamento' }))
    const modal = dialog('Definir orçamento')
    expect(
      within(modal).queryByRole('button', { name: 'Excluir orçamento' }),
    ).not.toBeInTheDocument()

    await typeTotal(modal, '17.000')

    await closed()
    expect(createBudget).toHaveBeenCalledWith('t1', 17000)
    expect(updateBudget).not.toHaveBeenCalled()
    expect(await summary()).toBeInTheDocument()
  })

  it('changes the total of the existing budget', async () => {
    vi.mocked(updateBudget).mockResolvedValue(makeBudget())
    renderTab()
    await summary()
    await userEvent.click(button('Alterar total'))
    const modal = dialog('Alterar orçamento')
    expect(within(modal).getByLabelText('Orçamento total (BRL)')).toHaveValue('17000')

    await typeTotal(modal, '12500,50')

    await closed()
    expect(updateBudget).toHaveBeenCalledWith('b1', 12500.5)
    expect(createBudget).not.toHaveBeenCalled()
    expect(getBudgetSummary).toHaveBeenCalledTimes(2)
  })

  it.each([
    ['', 'Informe o valor total.'],
    ['muito', 'Informe um valor como 8.500 ou 8.500,50.'],
    ['1000000000', 'O valor máximo é'],
  ])('does not send the total "%s"', async (value, message) => {
    renderTab()
    await summary()
    await userEvent.click(button('Alterar total'))
    const modal = dialog('Alterar orçamento')

    await typeTotal(modal, value)

    expect(within(modal).getByText(message, { exact: false })).toBeInTheDocument()
    expect(findBudget).not.toHaveBeenCalled()
  })

  it.each([
    [422, { message: ['totalValue must not be less than 0'] }, /Este campo/],
    [409, undefined, /já tem um orçamento/],
    [403, undefined, /não tem permissão/],
  ])('keeps the window open and explains a %i', async (status, body, message) => {
    vi.mocked(updateBudget).mockRejectedValue(ApiError.fromResponse(status, body))
    renderTab()
    await summary()
    await userEvent.click(button('Alterar total'))
    const modal = dialog('Alterar orçamento')

    await typeTotal(modal, '10')

    expect(await within(modal).findByText(message)).toBeInTheDocument()
  })

  it('deletes only after the confirmation', async () => {
    vi.mocked(deleteBudget).mockResolvedValue(undefined)
    renderTab()
    await summary()
    await userEvent.click(button('Alterar total'))
    await userEvent.click(button('Excluir orçamento'))
    expect(deleteBudget).not.toHaveBeenCalled()
    vi.mocked(getBudgetSummary).mockResolvedValue(noBudget())

    await userEvent.click(
      within(dialog('Excluir o orçamento?')).getByRole('button', { name: 'Excluir' }),
    )

    await closed()
    expect(deleteBudget).toHaveBeenCalledWith('b1')
    expect(
      await screen.findByRole('heading', { name: 'Defina o orçamento da viagem' }),
    ).toBeInTheDocument()
  })

  it('treats a budget already removed by someone else as deleted', async () => {
    vi.mocked(findBudget).mockResolvedValue(null)
    renderTab()
    await summary()
    await userEvent.click(button('Alterar total'))
    await userEvent.click(button('Excluir orçamento'))

    await userEvent.click(
      within(dialog('Excluir o orçamento?')).getByRole('button', { name: 'Excluir' }),
    )

    await closed()
    expect(deleteBudget).not.toHaveBeenCalled()
  })

  it('explains a failed deletion and lets the person give up', async () => {
    vi.mocked(deleteBudget).mockRejectedValue(ApiError.fromResponse(500))
    renderTab()
    await summary()
    await userEvent.click(button('Alterar total'))
    await userEvent.click(button('Excluir orçamento'))
    const confirmation = dialog('Excluir o orçamento?')

    await userEvent.click(within(confirmation).getByRole('button', { name: 'Excluir' }))
    expect(await within(confirmation).findByRole('alert')).toHaveTextContent(
      'O servidor está com problemas.',
    )

    await userEvent.click(within(confirmation).getByRole('button', { name: 'Cancelar' }))
    expect(dialog('Alterar orçamento')).toBeInTheDocument()
  })
})
