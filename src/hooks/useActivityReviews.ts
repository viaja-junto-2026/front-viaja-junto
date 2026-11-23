import { listReviews } from '../services/reviews'
import { usePaginatedQuery } from './usePaginatedQuery'

/** Chave de cache das avaliações paginadas de uma atividade. */
export function activityReviewsKey(activityId: string) {
  return ['reviews', 'activity', activityId] as const
}

type UseActivityReviewsOptions = {
  /** Quantas avaliações exibir por página (padrão 10). */
  initialLimit?: number
  /** Permite adiar a busca (por exemplo, enquanto a atividade ainda carrega). */
  enabled?: boolean
}

/** Lista paginada de avaliações de uma atividade do catálogo. */
export function useActivityReviews(
  activityId: string,
  { initialLimit = 10, enabled = true }: UseActivityReviewsOptions = {},
) {
  return usePaginatedQuery({
    queryKey: activityReviewsKey(activityId),
    queryFn: ({ page, limit }) => listReviews({ activityId, page, limit }),
    initialLimit,
    enabled: Boolean(activityId) && enabled,
  })
}
