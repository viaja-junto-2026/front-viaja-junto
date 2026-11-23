import type { Paginated } from '../types/pagination'
import type { DestinationCategory } from '../utils/labels'
import { apiClient } from './apiClient'
import { unwrap } from './apiError'
import type { components } from './generated/schema'

/** Destino do catálogo (cidade pública, com nota média). */
export type Destination = components['schemas']['DestinationCatalogResponseDto']

/** Detalhes públicos de um destino do catálogo, com nota média e últimas avaliações. */
export type DestinationDetails = components['schemas']['DestinationCatalogDetailsResponseDto']

type ListTopDestinationsParams = {
  /** Quantos destinos trazer (de 1 a 50; o padrão da API é 10). */
  limit?: number
}

export type ListDestinationsParams = {
  /** Número da página, começando em 1. */
  page?: number
  /** Quantidade de registros por página (máximo 100). */
  limit?: number
  /** Busca textual pelo nome do destino. */
  q?: string
  /** Nome do país ou código ISO (ex.: `França` ou `FR`). */
  country?: string
  /** Categoria de descoberta (`CITY`, `BEACH`, `NATURE`, `CULTURAL`). */
  category?: DestinationCategory
}

/**
 * Lista destinos do catálogo público com busca, filtros e paginação.
 * Rota pública; lança `ApiError` se a API falhar.
 */
export async function listDestinations(
  params: ListDestinationsParams = {},
): Promise<Paginated<Destination>> {
  const response = unwrap(
    await apiClient.GET('/api/destination-catalog', {
      params: { query: params },
    }),
  )

  return {
    data: response.data ?? [],
    meta: response.meta,
  }
}

/**
 * Destinos mais bem avaliados, do melhor para o pior (rota pública). A API só lista
 * destinos que já têm avaliação, então a lista pode vir vazia. Lança `ApiError` se falhar.
 */
export async function listTopDestinations({ limit }: ListTopDestinationsParams = {}): Promise<
  Destination[]
> {
  return unwrap(
    await apiClient.GET('/api/destination-catalog/top', { params: { query: { limit } } }),
  )
}

/**
 * Busca os detalhes públicos de um destino do catálogo pelo identificador.
 * Lança `ApiError` (404 se não existir, 400 se o id não for um UUID válido).
 */
export async function getDestinationDetails(id: string): Promise<DestinationDetails> {
  return unwrap(
    await apiClient.GET('/api/destination-catalog/{id}/details', {
      params: { path: { id } },
    }),
  )
}
