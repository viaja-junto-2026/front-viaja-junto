import type { Paginated } from '../types/pagination'
import { apiClient } from './apiClient'
import { unwrap } from './apiError'
import type { components } from './generated/schema'

/** Avaliação de uma atividade devolvida pela listagem paginada. */
export type ActivityReview = components['schemas']['ReviewResponseDto']

export type ListReviewsParams = {
  /** Filtra pelas avaliações de uma atividade específica do catálogo. */
  activityId?: string
  /** Número da página, começando em 1. */
  page?: number
  /** Quantidade de registros por página (máximo 100). */
  limit?: number
}

/**
 * Lista avaliações de atividades de forma paginada, das mais recentes para as mais antigas.
 * Rota pública; lança `ApiError` se a API falhar.
 */
export async function listReviews({ activityId, page, limit }: ListReviewsParams = {}): Promise<
  Paginated<ActivityReview>
> {
  const response = unwrap(
    await apiClient.GET('/api/reviews', {
      params: { query: { activityId, page, limit } },
    }),
  )

  return {
    data: response.data ?? [],
    meta: response.meta,
  }
}
