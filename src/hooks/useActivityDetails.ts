import { useQuery } from '@tanstack/react-query'
import { getActivityDetails } from '../services/activities'

/** Chave de cache dos detalhes de uma atividade (use para invalidar ou refazer a busca). */
export function activityDetailsKey(id: string) {
  return ['activities', 'details', id] as const
}

/** Busca os detalhes públicos de uma atividade do catálogo pelo `id`. */
export function useActivityDetails(id: string) {
  return useQuery({
    queryKey: activityDetailsKey(id),
    queryFn: () => getActivityDetails(id),
    enabled: Boolean(id),
  })
}
