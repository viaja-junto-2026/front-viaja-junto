import { formatReviewCount } from '../../utils/format'
import { RatingStars } from './RatingStars'

type RatingSummaryProps = {
  /** Nota média; `null` quando ainda não há avaliações. */
  rating: number | null
  reviewCount: number
}

/** Nota média em estrelas com a quantidade de avaliações, ou o aviso de que não há nota. */
export function RatingSummary({ rating, reviewCount }: RatingSummaryProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {rating !== null ? (
        <>
          <RatingStars rating={rating} size="md" showValue />
          <span className="text-body-sm text-gray-dim tabular">
            ({formatReviewCount(reviewCount)})
          </span>
        </>
      ) : (
        <span className="text-body-sm text-gray-dim">Ainda sem nota média</span>
      )}
    </div>
  )
}
