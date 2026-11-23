import {
  listActivities,
  type ActivitySort,
  type ListActivitiesParams,
} from '../services/activities'
import type { ActivityType } from '../utils/labels'
import { usePaginatedQuery } from './usePaginatedQuery'

/** Chave base de cache das atividades do catálogo. */
export const activitiesKey = ['activities', 'catalog'] as const

export type ActivityFilters = {
  destinationId?: string
  type?: ActivityType
  minRating?: number
  sort?: ActivitySort
  q?: string
  city?: string
  country?: string
}

type UseActivitiesOptions = {
  initialFilters?: ActivityFilters
  initialLimit?: number
  enabled?: boolean
}

/**
 * Lista paginada de atividades do catálogo com filtros (destino, tipo, nota mínima e ordenação).
 * Alterar qualquer filtro volta automaticamente para a página 1.
 */
export function useActivities({
  initialFilters,
  initialLimit = 9,
  enabled = true,
}: UseActivitiesOptions = {}) {
  return usePaginatedQuery<
    Awaited<ReturnType<typeof listActivities>>['data'][number],
    ActivityFilters
  >({
    queryKey: activitiesKey,
    queryFn: (params: ListActivitiesParams) => listActivities(params),
    initialFilters,
    initialLimit,
    enabled,
  })
}
