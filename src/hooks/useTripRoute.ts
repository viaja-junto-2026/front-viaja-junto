import { useQueries, useQuery } from '@tanstack/react-query'
import { useAuth } from '../auth/useAuth'
import { getActivity, type Activity } from '../services/activities'
import { getDestination, type Destination } from '../services/destinations'
import {
  listTripActivities,
  listTripDestinations,
  type TripActivity,
  type TripDestination,
} from '../services/itinerary'
import { sortStops } from '../utils/itinerary'

/** O catálogo quase não muda: o que já foi buscado é reaproveitado por 10 minutos. */
const CATALOG_STALE_TIME = 10 * 60 * 1000

export function tripRouteKey(userId: string | undefined, tripId: string) {
  return ['trip-route', userId, tripId] as const
}

export type PlannedActivity = TripActivity & {
  /** Dados do catálogo; sem valor se ele não puder ser carregado. */
  catalog?: Activity
}

export type RouteStop = TripDestination & {
  catalog?: Destination
  activities: PlannedActivity[]
}

/** Paradas e atividades. A API não filtra atividades por viagem: é uma busca por parada. */
async function loadRoute(tripId: string) {
  const stops = sortStops(await listTripDestinations(tripId))
  const activities = await Promise.all(stops.map((stop) => listTripActivities(stop.id)))
  return stops.map((stop, index) => ({ stop, activities: activities[index] }))
}

function unique(ids: string[]): string[] {
  return [...new Set(ids)]
}

/**
 * Busca no catálogo cada item uma única vez, mesmo que ele se repita no roteiro.
 * Uma falha no catálogo não derruba o roteiro: o item aparece sem os dados dele.
 */
function useCatalog<TItem>(
  kind: 'destination' | 'activity',
  ids: string[],
  fetchItem: (id: string) => Promise<TItem>,
) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ['catalog', kind, id],
      queryFn: () => fetchItem(id),
      staleTime: CATALOG_STALE_TIME,
    })),
    combine: (results) => ({
      isLoading: results.some((result) => result.isLoading),
      byId: new Map(ids.map((id, index) => [id, results[index].data])),
    }),
  })
}

/** Roteiro de uma viagem: paradas na ordem da visita, com as atividades e o catálogo. */
export function useTripRoute(tripId: string) {
  const { user } = useAuth()
  const route = useQuery({
    queryKey: tripRouteKey(user?.id, tripId),
    queryFn: () => loadRoute(tripId),
    enabled: Boolean(tripId),
  })

  const data = route.data ?? []
  const destinations = useCatalog(
    'destination',
    unique(data.map(({ stop }) => stop.destinationCatalogId)),
    getDestination,
  )
  const activities = useCatalog(
    'activity',
    unique(data.flatMap((item) => item.activities.map((a) => a.activityCatalogId))),
    getActivity,
  )

  const stops: RouteStop[] = data.map(({ stop, activities: planned }) => ({
    ...stop,
    catalog: destinations.byId.get(stop.destinationCatalogId),
    activities: planned.map((activity) => ({
      ...activity,
      catalog: activities.byId.get(activity.activityCatalogId),
    })),
  }))

  const isLoading = route.isLoading || destinations.isLoading || activities.isLoading

  return {
    stops,
    activityCount: stops.reduce((total, stop) => total + stop.activities.length, 0),
    isLoading,
    isError: route.isError,
    error: route.error,
    isEmpty: !isLoading && !route.isError && stops.length === 0,
    refetch: route.refetch,
  }
}
