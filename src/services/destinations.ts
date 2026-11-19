import { apiClient } from './apiClient'
import { unwrap } from './apiError'
import type { components } from './generated/schema'

/** Destino do catálogo (cidade pública, com nota média). */
export type Destination = components['schemas']['DestinationCatalogResponseDto']

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
