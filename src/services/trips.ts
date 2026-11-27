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

type CreateTripBody = components['schemas']['CreateTripDto']
type UpdateTripBody = components['schemas']['UpdateTripDto']

/** Dados de uma viagem como o formulário os entrega. Data sem preencher é `null`. */
export type TripInput = {
  name: string
  description: string
  startDate: string | null
  endDate: string | null
  status: TripStatus
  currency: string
}

/** Cria uma viagem; quem cria vira o dono. Campos vazios ficam de fora. Lança `ApiError`. */
export async function createTrip(input: TripInput): Promise<Trip> {
  const { name, status, currency, description, startDate, endDate } = input
  const body: CreateTripBody = {
    name,
    status,
    currency,
    ...(description && { description }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  }

  return unwrap(await apiClient.POST('/api/trips', { body }))
}

/** Busca uma viagem em que o usuário participa. Lança `ApiError` (404 se não existir). */
export async function getTrip(id: string): Promise<Trip> {
  return unwrap(await apiClient.GET('/api/trips/{id}', { params: { path: { id } } }))
}

/** Edita uma viagem (só o criador pode). Lança `ApiError` (403, 404, 409 na moeda, 422). */
export async function updateTrip(id: string, input: TripInput): Promise<Trip> {
  // O contrato não declara, mas a API aceita `null` para apagar uma data já salva.
  const body = input as unknown as UpdateTripBody

  return unwrap(await apiClient.PATCH('/api/trips/{id}', { params: { path: { id } }, body }))
}

/** Exclui a viagem e tudo o que é dela (só o criador pode). Lança `ApiError`. */
export async function deleteTrip(id: string): Promise<void> {
  unwrap(await apiClient.DELETE('/api/trips/{id}', { params: { path: { id } } }))
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
