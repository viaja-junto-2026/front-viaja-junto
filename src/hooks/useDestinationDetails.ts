import { useQuery } from '@tanstack/react-query'
import { getDestinationDetails } from '../services/destinations'

/** Chave de cache dos detalhes de um destino (use para invalidar ou refazer a busca). */
export function destinationDetailsKey(id: string) {
  return ['destinations', 'details', id] as const
}

/** Busca os detalhes públicos de um destino do catálogo pelo `id`. */
export function useDestinationDetails(id: string) {
  return useQuery({
    queryKey: destinationDetailsKey(id),
    queryFn: () => getDestinationDetails(id),
    enabled: Boolean(id),
  })
}
