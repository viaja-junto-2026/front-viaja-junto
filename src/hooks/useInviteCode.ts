import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/useAuth'
import { getInviteCode, joinTrip, regenerateInviteCode } from '../services/invites'
import type { Trip } from '../services/trips'
import { useApiMutation } from './useApiMutation'
import { tripKey } from './useTrip'
import { tripsKey } from './useTrips'

/** O código de convite de uma viagem (só para quem a criou) e a troca por um novo. */
export function useInviteCode(tripId: string) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const queryKey = ['invite-code', user?.id, tripId]
  const invite = useQuery({ queryKey, queryFn: () => getInviteCode(tripId) })

  const regenerate = useApiMutation<string, void>({
    mutationFn: () => regenerateInviteCode(tripId),
    onSuccess: (code) => queryClient.setQueryData(queryKey, code),
  })

  return { invite, regenerate }
}

/** Entra em uma viagem pelo código e atualiza a lista de viagens. */
export function useJoinTrip(onSuccess: (trip: Trip) => void) {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useApiMutation({
    mutationFn: joinTrip,
    invalidateKeys: [tripsKey],
    onSuccess: (trip: Trip) => {
      queryClient.setQueryData(tripKey(user?.id, trip.id), trip)
      onSuccess(trip)
    },
  })
}
