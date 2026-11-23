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
