import type { Paginated } from '../types/pagination'
import { apiClient } from './apiClient'
import { unwrap } from './apiError'
import type { components } from './generated/schema'

/** Parada de uma viagem: aponta para um destino do catálogo e guarda as datas e a ordem. */
export type TripDestination = components['schemas']['TripDestinationResponseDto']

/** Atividade planejada em uma parada: data e hora, duração, custo e status. */
export type TripActivity = components['schemas']['TripActivityResponseDto']

type Schemas = components['schemas']

/** Dados de uma parada como o formulário os entrega. Data sem preencher é `null`. */
export type StopInput = {
  arrival: string | null
  departure: string | null
  description: string
}

/** Dados de uma atividade como o formulário os entrega. Campo sem preencher é `null`. */
export type TripActivityInput = {
  dateTime: string | null
  durationMinutes: number | null
  expectedCost: number | null
  status: TripActivity['status']
}

/** Tira o que está vazio: na criação a API só aceita campos preenchidos. */
function filled<TInput extends object>(input: TInput): Partial<TInput> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== null && value !== ''),
  ) as Partial<TInput>
}

/** Acrescenta uma parada à viagem. Lança `ApiError` (403, 422 nas datas). */
export async function createTripDestination(
  input: StopInput & { tripId: string; destinationCatalogId: string; order: number },
): Promise<TripDestination> {
  const body = filled(input) as unknown as Schemas['CreateTripDestinationDto']
  return unwrap(await apiClient.POST('/api/trip-destinations', { body }))
}

/** Edita as datas e a descrição de uma parada. Lança `ApiError`. */
export async function updateTripDestination(
  id: string,
  input: StopInput,
): Promise<TripDestination> {
  // O contrato não declara, mas a API aceita `null` para apagar uma data já salva.
  const body = input as unknown as Schemas['UpdateTripDestinationDto']
  return unwrap(
    await apiClient.PATCH('/api/trip-destinations/{id}', { params: { path: { id } }, body }),
  )
}

/** Remove a parada e as atividades dela. Lança `ApiError`. */
export async function deleteTripDestination(id: string): Promise<void> {
  unwrap(await apiClient.DELETE('/api/trip-destinations/{id}', { params: { path: { id } } }))
}

/** Grava a nova ordem das paradas: a lista precisa ter todas, uma vez cada. */
export async function reorderTripDestinations(
  tripId: string,
  destinationIds: string[],
): Promise<void> {
  unwrap(
    await apiClient.PUT('/api/trips/{tripId}/destinations/order', {
      params: { path: { tripId } },
      body: { destinationIds },
    }),
  )
}

/** Planeja uma atividade em uma parada. Lança `ApiError` (403, 422). */
export async function createTripActivity(
  input: TripActivityInput & { tripDestinationId: string; activityCatalogId: string },
): Promise<TripActivity> {
  const body = filled(input) as unknown as Schemas['CreateTripActivityDto']
  return unwrap(await apiClient.POST('/api/trip-activities', { body }))
}

/** Edita uma atividade planejada. `null` apaga o que estava salvo. */
export async function updateTripActivity(
  id: string,
  input: TripActivityInput,
): Promise<TripActivity> {
  const body = input as unknown as Schemas['UpdateTripActivityDto']
  return unwrap(
    await apiClient.PATCH('/api/trip-activities/{id}', { params: { path: { id } }, body }),
  )
}

/** Remove uma atividade do roteiro. Lança `ApiError`. */
export async function deleteTripActivity(id: string): Promise<void> {
  unwrap(await apiClient.DELETE('/api/trip-activities/{id}', { params: { path: { id } } }))
}

/** Máximo de registros que a API devolve por página. */
const PAGE_SIZE = 100

/** Junta todas as páginas de uma lista: o roteiro precisa aparecer inteiro. */
async function listAll<TItem>(
  fetchPage: (page: number) => Promise<Paginated<TItem>>,
): Promise<TItem[]> {
  const items: TItem[] = []
  let page = 1
  let hasNext = true

  while (hasNext) {
    const response = await fetchPage(page)
    items.push(...(response.data ?? []))
    hasNext = response.meta.hasNext
    page += 1
  }

  return items
}

/** Todas as paradas de uma viagem. Lança `ApiError` (403 sem acesso). */
export function listTripDestinations(tripId: string): Promise<TripDestination[]> {
  return listAll(async (page) => {
    const response = unwrap(
      await apiClient.GET('/api/trip-destinations', {
        params: { query: { tripId, page, limit: PAGE_SIZE } },
      }),
    )
    return { data: response.data ?? [], meta: response.meta }
  })
}

/** Todas as atividades de uma parada. Lança `ApiError`. */
export function listTripActivities(tripDestinationId: string): Promise<TripActivity[]> {
  return listAll(async (page) => {
    const response = unwrap(
      await apiClient.GET('/api/trip-activities', {
        params: { query: { tripDestinationId, page, limit: PAGE_SIZE } },
      }),
    )
    return { data: response.data ?? [], meta: response.meta }
  })
}
