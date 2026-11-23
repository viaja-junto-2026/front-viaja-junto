import { apiClient } from './apiClient'
import { unwrap } from './apiError'
import type { components } from './generated/schema'

/** Detalhes públicos de uma atividade do catálogo, com nota média e avaliações recentes. */
export type ActivityDetails = components['schemas']['ActivityCatalogDetailsResponseDto']

/** Avaliação pública com nome do autor (nunca expõe e-mail). */
export type PublicReview = components['schemas']['PublicReviewResponseDto']

/**
 * Busca os detalhes públicos de uma atividade do catálogo pelo identificador.
 * Lança `ApiError` (404 se não existir, 400 se o id não for um UUID válido).
 */
export async function getActivityDetails(id: string): Promise<ActivityDetails> {
  return unwrap(
    await apiClient.GET('/api/activity-catalog/{id}/details', {
      params: { path: { id } },
    }),
  )
}
