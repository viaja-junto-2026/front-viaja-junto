import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/useAuth'
import { createTrip, deleteTrip, updateTrip, type Trip, type TripInput } from '../services/trips'
import { budgetSummaryKey } from './budgetKeys'
import { useApiMutation } from './useApiMutation'
import { tripKey } from './useTrip'
import { tripsKey } from './useTrips'

/** Cria uma viagem e atualiza a lista e as contagens. */
export function useCreateTrip(onSuccess: (trip: Trip) => void) {
  return useApiMutation({ mutationFn: createTrip, invalidateKeys: [tripsKey], onSuccess })
}

/** Edita uma viagem, guarda a versão nova no cache e atualiza a lista. */
export function useUpdateTrip(id: string, onSuccess: (trip: Trip) => void) {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useApiMutation({
    mutationFn: (input: TripInput) => updateTrip(id, input),
    // O resumo do orçamento usa a moeda da viagem.
    invalidateKeys: [tripsKey, budgetSummaryKey(user?.id, id)],
    onSuccess: (trip: Trip) => {
      queryClient.setQueryData(tripKey(user?.id, id), trip)
      onSuccess(trip)
    },
  })
}

/** Exclui uma viagem, atualiza a lista e descarta a viagem do cache. */
export function useDeleteTrip(id: string, onSuccess: () => void) {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useApiMutation<void, void>({
    mutationFn: () => deleteTrip(id),
    invalidateKeys: [tripsKey],
    onSuccess: () => {
      onSuccess()
      queryClient.removeQueries({ queryKey: tripKey(user?.id, id) })
    },
  })
}
