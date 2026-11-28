import { apiClient } from './apiClient'
import { unwrap } from './apiError'
import type { Trip } from './trips'

/** O código de convite da viagem. Só o criador pode ler (403 para os demais). */
export async function getInviteCode(tripId: string): Promise<string> {
  const { code } = unwrap(
    await apiClient.GET('/api/trips/{id}/invite-code', { params: { path: { id: tripId } } }),
  )
  return code
}

/** Troca o código: o anterior para de funcionar e quem já entrou continua na viagem. */
export async function regenerateInviteCode(tripId: string): Promise<string> {
  const { code } = unwrap(
    await apiClient.POST('/api/trips/{id}/invite-code/regenerate', {
      params: { path: { id: tripId } },
    }),
  )
  return code
}

/**
 * Entra na viagem do código, como Visualizador. Lança `ApiError`: 404 (código que não
 * existe), 409 (já participa ou criou a viagem), 422 (formato) e 429 (muitas tentativas).
 */
export async function joinTrip(code: string): Promise<Trip> {
  return unwrap(await apiClient.POST('/api/trips/join', { body: { code } }))
}
