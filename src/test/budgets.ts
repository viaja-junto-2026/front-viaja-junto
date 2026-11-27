import type { Budget, BudgetSummary } from '../services/budgets'

/** Orçamento de uma viagem para os testes. */
export function makeBudget(overrides: Partial<Budget> = {}): Budget {
  return {
    id: 'b1',
    tripId: 't1',
    totalValue: 17000,
    currency: 'BRL',
    createdAt: '2026-10-20T12:00:00.000Z',
    ...overrides,
  }
}

/** Resumo do orçamento para os testes, com os números da viagem de demonstração. */
export function makeBudgetSummary(overrides: Partial<BudgetSummary> = {}): BudgetSummary {
  return {
    currency: 'BRL',
    totalValue: 17000,
    planned: 10531,
    remaining: 6469,
    spent: 0,
    remainingAfterSpent: 17000,
    overBudget: false,
    activityCount: 21,
    unpricedActivities: 0,
    byCategory: [
      { type: 'TOUR', planned: 2080, count: 12 },
      { type: 'FOOD', planned: 1097, count: 6 },
      { type: 'LODGING', planned: 7354, count: 3 },
      { type: 'TRANSPORT', planned: 0, count: 0 },
      { type: 'OTHER', planned: 0, count: 0 },
    ],
    ...overrides,
  }
}
