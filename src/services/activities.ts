import type { Paginated } from '../types/pagination'
import type { ActivityType } from '../utils/labels'
import { apiClient } from './apiClient'
import { unwrap } from './apiError'
import type { components } from './generated/schema'

/** Atividade do catálogo público. */
export type Activity = components['schemas']['ActivityCatalogResponseDto']

/** Detalhes públicos de uma atividade do catálogo, com nota média e avaliações recentes. */
export type ActivityDetails = components['schemas']['ActivityCatalogDetailsResponseDto']

/** Avaliação pública com nome do autor (nunca expõe e-mail). */
export type PublicReview = components['schemas']['PublicReviewResponseDto']

/** Ordenação suportada pela listagem de atividades do catálogo. */
export type ActivitySort = 'name' | 'rating'

export type ListActivitiesParams = {
  /** Filtra pelas atividades pertencentes a um destino do catálogo. */
  destinationId?: string
  /** Filtra pela categoria da atividade. */
  type?: ActivityType
  /** Apenas atividades com nota média maior ou igual a este valor. */
  minRating?: number
  /** Ordenação: `name` (A–Z, padrão) ou `rating` (melhor avaliadas primeiro). */
  sort?: ActivitySort
  /** Busca textual pelo nome da atividade. */
  q?: string
  city?: string
  country?: string
  /** Número da página, começando em 1. */
  page?: number
  /** Quantidade de registros por página (máximo 100). */
  limit?: number
}

/**
 * Lista atividades do catálogo público com filtros e paginação.
 * Rota pública; lança `ApiError` se a API falhar.
 */
export async function listActivities(
  params: ListActivitiesParams = {},
): Promise<Paginated<Activity>> {
  const response = unwrap(
    await apiClient.GET('/api/activity-catalog', {
      params: { query: params },
    }),
  )

  return {
    data: response.data ?? [],
    meta: response.meta,
  }
}

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
