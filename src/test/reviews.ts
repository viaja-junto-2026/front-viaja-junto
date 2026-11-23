import type { ActivityReview } from '../services/reviews'
import type { Paginated, PaginationMeta } from '../types/pagination'

/** Avaliação paginada de atividade para os testes. */
export function makeActivityReview(overrides: Partial<ActivityReview> = {}): ActivityReview {
  return {
    id: 'r1',
    userId: 'u1',
    activityId: 'a1',
    rating: 5,
    comment: 'Vale cada minuto da fila.',
    createdAt: '2026-08-02T19:45:00.000Z',
    ...overrides,
  }
}

/** Metadados de paginação para os testes. */
export function makePaginationMeta(overrides: Partial<PaginationMeta> = {}): PaginationMeta {
  return {
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
    ...overrides,
  }
}

/** Resposta paginada de avaliações para os testes. */
export function makePaginatedReviews(
  data: ActivityReview[] = [makeActivityReview()],
  metaOverrides: Partial<PaginationMeta> = {},
): Paginated<ActivityReview> {
  return {
    data,
    meta: makePaginationMeta({
      total: data.length,
      ...metaOverrides,
    }),
  }
}
