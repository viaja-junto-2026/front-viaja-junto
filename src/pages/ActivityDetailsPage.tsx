import { ArrowLeft, MapPinOff } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { ErrorState } from '../components/feedback/ErrorState'
import { LoadingSkeleton } from '../components/feedback/LoadingSkeleton'
import { ReviewList, type ReviewListItem } from '../components/reviews/ReviewList'
import { ButtonLink } from '../components/ui/ButtonLink'
import { IconCircle } from '../components/ui/IconCircle'
import { SectionHeader } from '../components/ui/SectionHeader'
import { focusRing } from '../components/ui/focus'
import { useActivityDetails } from '../hooks/useActivityDetails'
import { useActivityReviews } from '../hooks/useActivityReviews'
import { paths } from '../routes/paths'
import { ApiError } from '../services/apiError'
import { getErrorMessage } from '../utils/errorMessages'
import { ActivityHeader } from './activity/ActivityHeader'

/** Indica se o erro da API significa atividade inexistente ou identificador inválido. */
function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 404 || error.status === 400)
}

function ActivityNotFound() {
  return (
    <section className="flex flex-col items-center gap-4 px-4 py-12 text-center">
      <IconCircle icon={MapPinOff} size="lg" />
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-headline-md text-red-burgundy lg:text-headline-lg">
          Atividade não encontrada
        </h1>
        <p className="max-w-md text-body-md text-gray-dim">
          A atividade que você procurou não existe ou o endereço está incorreto.
        </p>
      </div>
      <ButtonLink to={paths.destinations} variant="primary">
        Explorar destinos
      </ButtonLink>
    </section>
  )
}

function ActivityDetailsContent({ id }: { id: string }) {
  const activityQuery = useActivityDetails(id)
  const reviewsQuery = useActivityReviews(id, { enabled: Boolean(activityQuery.data) })

  if (!id || isNotFoundError(activityQuery.error)) {
    return <ActivityNotFound />
  }

  if (activityQuery.isLoading) {
    return (
      <section aria-label="Carregando atividade" className="flex flex-col gap-8 py-8">
        <LoadingSkeleton variant="card" count={2} label="Carregando detalhes da atividade" />
      </section>
    )
  }

  if (activityQuery.isError || !activityQuery.data) {
    return (
      <section className="py-8">
        <ErrorState
          message={getErrorMessage(activityQuery.error)}
          onRetry={() => void activityQuery.refetch()}
        />
      </section>
    )
  }

  const activity = activityQuery.data
  // A listagem paginada `/api/reviews` não devolve `authorName`; enriquecemos com `latestReviews`.
  const authorNamesByReviewId = new Map(
    activity.latestReviews.map((review) => [review.id, review.authorName]),
  )
  const reviewItems: ReviewListItem[] = reviewsQuery.items.map((review) => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    authorName: authorNamesByReviewId.get(review.id) ?? null,
  }))

  return (
    <div className="flex flex-col gap-10 py-8">
      <div>
        <Link
          to={paths.destinations}
          className={`inline-flex items-center gap-2 rounded-xs text-label-md text-red-burgundy transition-colors hover:text-red-ruby ${focusRing}`}
        >
          <ArrowLeft aria-hidden="true" size={20} />
          <span>Explorar destinos</span>
        </Link>
      </div>

      <ActivityHeader activity={activity} />

      <section aria-label="Avaliações" className="flex flex-col gap-6">
        <SectionHeader title="Avaliações">
          {activity.reviewCount > 0 && (
            <span className="text-body-sm text-gray-dim tabular">
              {activity.reviewCount === 1 ? '1 avaliação' : `${activity.reviewCount} avaliações`}
            </span>
          )}
        </SectionHeader>

        <ReviewList
          items={reviewItems}
          isLoading={reviewsQuery.isLoading}
          isFetching={reviewsQuery.isFetching}
          isError={reviewsQuery.isError}
          error={reviewsQuery.error}
          onRetry={() => void reviewsQuery.refetch()}
          page={reviewsQuery.page}
          totalPages={reviewsQuery.meta?.totalPages}
          hasPrevious={reviewsQuery.hasPrevious}
          hasNext={reviewsQuery.hasNext}
          onPageChange={reviewsQuery.setPage}
        />
      </section>
    </div>
  )
}

/** Tela pública de detalhes da atividade (`/activities/:id`), com nota média e avaliações paginadas. */
export default function ActivityDetailsPage() {
  const { id = '' } = useParams<{ id: string }>()
  return <ActivityDetailsContent key={id} id={id} />
}
