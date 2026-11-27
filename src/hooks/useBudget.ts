import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../auth/useAuth'
import {
  createBudget,
  deleteBudget,
  findBudget,
  getBudgetSummary,
  updateBudget,
} from '../services/budgets'
import { useApiMutation } from './useApiMutation'
import { budgetSummaryKey } from './budgetKeys'

/**
 * Só as mudanças no total, para a janela de edição: usar `useBudget` nela buscaria o resumo
 * de novo ao abrir, e o conteúdo poderia mudar enquanto a pessoa digita.
 */
export function useBudgetMutations(tripId: string) {
  const { user } = useAuth()
  const queryKey = budgetSummaryKey(user?.id, tripId)

  // O id é procurado na hora de salvar: se alguém definiu o orçamento nesse meio tempo,
  // o total é alterado, em vez de a API recusar um segundo orçamento.
  const save = useApiMutation({
    mutationFn: async (totalValue: number) => {
      const current = await findBudget(tripId)
      return current ? updateBudget(current.id, totalValue) : createBudget(tripId, totalValue)
    },
    invalidateKeys: [queryKey],
  })

  const remove = useApiMutation<void, void>({
    mutationFn: async () => {
      const current = await findBudget(tripId)
      if (current) await deleteBudget(current.id)
    },
    invalidateKeys: [queryKey],
  })

  return { save, remove }
}

/** Resumo do orçamento de uma viagem e as mudanças no total. */
export function useBudget(tripId: string) {
  const { user } = useAuth()
  const summary = useQuery({
    queryKey: budgetSummaryKey(user?.id, tripId),
    queryFn: () => getBudgetSummary(tripId),
  })

  return { summary, ...useBudgetMutations(tripId) }
}
