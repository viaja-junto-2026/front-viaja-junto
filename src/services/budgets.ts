import { apiClient } from './apiClient'
import { unwrap } from './apiError'
import type { components } from './generated/schema'

/** O orçamento de uma viagem: só o total; o resto é calculado no resumo. */
export type Budget = components['schemas']['BudgetResponseDto']

/** Como está o orçamento: total, planejado, saldo, estouro e consumo por categoria. */
export type BudgetSummary = components['schemas']['BudgetSummaryResponseDto']

export type CategoryConsumption = BudgetSummary['byCategory'][number]

/** O maior tamanho de página que a API aceita. */
const PAGE_SIZE = 100

/** Resumo do orçamento; `totalValue` vem nulo enquanto a viagem não tem um. */
export async function getBudgetSummary(tripId: string): Promise<BudgetSummary> {
  return unwrap(
    await apiClient.GET('/api/trips/{id}/budget/summary', { params: { path: { id: tripId } } }),
  )
}

/**
 * O orçamento de uma viagem, ou `null`. O resumo não traz o id e a lista não filtra por
 * viagem, então é preciso procurar nas páginas.
 */
export async function findBudget(tripId: string): Promise<Budget | null> {
  for (let page = 1; ; page += 1) {
    const { data, meta } = unwrap(
      await apiClient.GET('/api/budgets', { params: { query: { page, limit: PAGE_SIZE } } }),
    )
    const found = data.find((budget) => budget.tripId === tripId)
    if (found) return found
    if (!meta.hasNext) return null
  }
}

/** Define o orçamento. Lança `ApiError` (403; 409 se a viagem já tem um). */
export async function createBudget(tripId: string, totalValue: number): Promise<Budget> {
  return unwrap(await apiClient.POST('/api/budgets', { body: { tripId, totalValue } }))
}

/** Altera o total. Lança `ApiError`. */
export async function updateBudget(id: string, totalValue: number): Promise<Budget> {
  return unwrap(
    await apiClient.PATCH('/api/budgets/{id}', {
      params: { path: { id } },
      body: { totalValue },
    }),
  )
}

/** Deixa a viagem sem orçamento; o roteiro não muda. Lança `ApiError`. */
export async function deleteBudget(id: string): Promise<void> {
  unwrap(await apiClient.DELETE('/api/budgets/{id}', { params: { path: { id } } }))
}
