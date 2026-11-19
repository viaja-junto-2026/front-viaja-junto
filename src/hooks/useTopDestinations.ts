import { useQuery } from '@tanstack/react-query'
import { listTopDestinations } from '../services/destinations'

/** Chave de cache dos destinos mais bem avaliados (use para refazer a busca). */
export const topDestinationsKey = ['destinations', 'top'] as const

/** Destinos mais bem avaliados, para a home. Devolve `data`, `isLoading`, `isError`, `error` e `refetch`. */
export function useTopDestinations(limit = 10) {
  return useQuery({
    queryKey: [...topDestinationsKey, limit],
    queryFn: () => listTopDestinations({ limit }),
  })
}
