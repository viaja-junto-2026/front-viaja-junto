import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/useAuth'
import type { Activity } from '../services/activities'
import type { Destination } from '../services/destinations'
import {
  createTripActivity,
  createTripDestination,
  deleteTripActivity,
  deleteTripDestination,
  reorderTripDestinations,
  updateTripActivity,
  updateTripDestination,
  type StopInput,
  type TripActivityInput,
} from '../services/itinerary'
import { budgetSummaryKey } from './budgetKeys'
import { useApiMutation } from './useApiMutation'
import { tripRouteKey } from './useTripRoute'

/** Depois de qualquer mudança, o roteiro e o orçamento (que soma os custos) são buscados de novo. */
function useRouteKeys(tripId: string) {
  const { user } = useAuth()
  return [tripRouteKey(user?.id, tripId), budgetSummaryKey(user?.id, tripId)]
}

/**
 * Guarda no cache o item escolhido no catálogo: ao atualizar o roteiro, a tela não precisa
 * buscá-lo de novo nem voltar para o carregamento.
 */
function useRememberCatalog() {
  const queryClient = useQueryClient()
  return (kind: 'destination' | 'activity', item: Destination | Activity) =>
    queryClient.setQueryData(['catalog', kind, item.id], item)
}

export function useAddStop(tripId: string, onSuccess: () => void) {
  const remember = useRememberCatalog()

  return useApiMutation({
    mutationFn: ({
      destination,
      order,
      input,
    }: {
      destination: Destination
      order: number
      input: StopInput
    }) => {
      remember('destination', destination)
      return createTripDestination({
        ...input,
        tripId,
        destinationCatalogId: destination.id,
        order,
      })
    },
    invalidateKeys: useRouteKeys(tripId),
    onSuccess,
  })
}

export function useUpdateStop(tripId: string, stopId: string, onSuccess: () => void) {
  return useApiMutation({
    mutationFn: (input: StopInput) => updateTripDestination(stopId, input),
    invalidateKeys: useRouteKeys(tripId),
    onSuccess,
  })
}

export function useRemoveStop(tripId: string, stopId: string, onSuccess: () => void) {
  return useApiMutation<void, void>({
    mutationFn: () => deleteTripDestination(stopId),
    invalidateKeys: useRouteKeys(tripId),
    onSuccess,
  })
}

export function useReorderStops(tripId: string) {
  return useApiMutation({
    mutationFn: (stopIds: string[]) => reorderTripDestinations(tripId, stopIds),
    invalidateKeys: useRouteKeys(tripId),
  })
}

export function useAddActivity(tripId: string, stopId: string, onSuccess: () => void) {
  const remember = useRememberCatalog()

  return useApiMutation({
    mutationFn: ({ activity, input }: { activity: Activity; input: TripActivityInput }) => {
      remember('activity', activity)
      return createTripActivity({
        ...input,
        tripDestinationId: stopId,
        activityCatalogId: activity.id,
      })
    },
    invalidateKeys: useRouteKeys(tripId),
    onSuccess,
  })
}

export function useUpdateActivity(tripId: string, activityId: string, onSuccess: () => void) {
  return useApiMutation({
    mutationFn: (input: TripActivityInput) => updateTripActivity(activityId, input),
    invalidateKeys: useRouteKeys(tripId),
    onSuccess,
  })
}

export function useRemoveActivity(tripId: string, activityId: string, onSuccess: () => void) {
  return useApiMutation<void, void>({
    mutationFn: () => deleteTripActivity(activityId),
    invalidateKeys: useRouteKeys(tripId),
    onSuccess,
  })
}
