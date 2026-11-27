import type { Paginated } from '../types/pagination'
import type { TripStatus } from '../utils/labels'
import { apiClient } from './apiClient'
import { unwrap } from './apiError'
import type { components } from './generated/schema'

/** Viagem do usuário logado, com o papel dele nela (`role`). */
export type Trip = components['schemas']['TripResponseDto']

export type ListTripsParams = {
  /** Número da página, começando em 1. */
  page?: number
  /** Quantidade de registros por página (máximo 100). */
  limit?: number
  /** Só viagens nesta etapa do planejamento. */
  status?: TripStatus
}

/**
 * Lista as viagens em que o usuário é criador ou colaborador (rota autenticada).
 * Lança `ApiError` se a API falhar.
 */
export async function listTrips(params: ListTripsParams = {}): Promise<Paginated<Trip>> {
  const response = unwrap(await apiClient.GET('/api/trips', { params: { query: params } }))

  return {
    data: response.data ?? [],
    meta: response.meta,
  }
}
