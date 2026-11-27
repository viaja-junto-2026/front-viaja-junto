import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../auth/useAuth'
import { listTripDestinations } from '../services/itinerary'

/** Só as paradas da viagem, sem atividades nem catálogo (para conferir as datas). */
export function useTripStops(tripId: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['trip-stops', user?.id, tripId],
    queryFn: () => listTripDestinations(tripId),
    // Sempre busca de novo: o roteiro pode ter mudado desde a última vez.
    staleTime: 0,
  })
}
