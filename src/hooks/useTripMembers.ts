import { useQueries, useQuery } from '@tanstack/react-query'
import { useAuth } from '../auth/useAuth'
import {
  listTripMembers,
  removeTripMember,
  updateMemberPermission,
  type MemberPermission,
} from '../services/members'
import type { Trip } from '../services/trips'
import { getUserName } from '../services/users'
import type { MemberRole } from '../utils/labels'
import { useApiMutation } from './useApiMutation'

const NAME_STALE_TIME = 10 * 60_000
/** Mostrado quando o nome de alguém não pôde ser buscado. */
export const UNKNOWN_NAME = 'Nome indisponível'

/** Uma pessoa da viagem, já com o nome. */
export type TripPerson = {
  userId: string
  name: string
  role: MemberRole
  isSelf: boolean
  /** Vazios para quem criou a viagem, que não tem registro de membro. */
  memberId?: string
  joinedAt?: string
}

const membersKey = (userId: string | undefined, tripId: string) =>
  ['trip-members', userId, tripId] as const

/**
 * As pessoas da viagem: quem a criou primeiro, depois os membros por ordem de entrada.
 * A API de membros só traz o id; o nome de cada pessoa é buscado à parte e fica em cache.
 */
export function useTripMembers(trip: Trip) {
  const { user } = useAuth()
  const members = useQuery({
    queryKey: membersKey(user?.id, trip.id),
    queryFn: () => listTripMembers(trip.id),
    // Alguém pode ter entrado com o código desde a última visita.
    staleTime: 0,
  })

  const sorted = [...(members.data ?? [])].sort((a, b) => a.joinedAt.localeCompare(b.joinedAt))
  const ids = members.data ? [trip.createdBy, ...sorted.map((member) => member.userId)] : []

  const names = useQueries({
    queries: ids.map((id) => ({
      queryKey: ['user-name', id],
      queryFn: () => getUserName(id),
      staleTime: NAME_STALE_TIME,
    })),
  })

  const nameOf = (index: number) => names[index]?.data ?? UNKNOWN_NAME
  const people: TripPerson[] = members.data
    ? [
        {
          userId: trip.createdBy,
          name: nameOf(0),
          role: 'OWNER',
          isSelf: trip.createdBy === user?.id,
        },
        ...sorted.map((member, index) => ({
          userId: member.userId,
          name: nameOf(index + 1),
          role: member.permission,
          isSelf: member.userId === user?.id,
          memberId: member.id,
          joinedAt: member.joinedAt,
        })),
      ]
    : []

  return {
    people,
    isLoading: members.isLoading || names.some((query) => query.isLoading),
    isError: members.isError,
    error: members.error,
    refetch: members.refetch,
  }
}

/** Muda a permissão ou remove um membro. Cada linha usa o seu, para o erro ficar nela. */
export function useMemberMutations(tripId: string, memberId: string) {
  const { user } = useAuth()
  const invalidateKeys = [membersKey(user?.id, tripId)]

  const changePermission = useApiMutation({
    mutationFn: (permission: MemberPermission) => updateMemberPermission(memberId, permission),
    invalidateKeys,
  })

  const remove = useApiMutation<void, void>({
    mutationFn: () => removeTripMember(memberId),
    invalidateKeys,
  })

  return { changePermission, remove }
}
