import { apiClient } from './apiClient'
import { unwrap } from './apiError'
import type { components } from './generated/schema'

/** A participação de uma pessoa em uma viagem. Não traz o nome (veja `getUserName`). */
export type TripMember = components['schemas']['TripMemberResponseDto']

export type MemberPermission = TripMember['permission']

/** O maior tamanho de página que a API aceita. */
const PAGE_SIZE = 100

/** Todos os membros da viagem. O criador não vem nesta lista. */
export async function listTripMembers(tripId: string): Promise<TripMember[]> {
  const members: TripMember[] = []

  for (let page = 1; ; page += 1) {
    const { data, meta } = unwrap(
      await apiClient.GET('/api/trip-members', {
        params: { query: { tripId, page, limit: PAGE_SIZE } },
      }),
    )
    members.push(...data)
    if (!meta.hasNext) return members
  }
}

/** Muda entre Editor e Visualizador (só o criador pode). */
export async function updateMemberPermission(
  id: string,
  permission: MemberPermission,
): Promise<TripMember> {
  return unwrap(
    await apiClient.PATCH('/api/trip-members/{id}', {
      params: { path: { id } },
      body: { permission },
    }),
  )
}

/** Tira o acesso da pessoa à viagem (só o criador pode). */
export async function removeTripMember(id: string): Promise<void> {
  unwrap(await apiClient.DELETE('/api/trip-members/{id}', { params: { path: { id } } }))
}
