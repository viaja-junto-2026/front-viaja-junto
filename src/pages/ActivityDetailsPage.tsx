import { MapPinOff } from 'lucide-react'
import { useParams } from 'react-router'
import { ErrorState } from '../components/feedback/ErrorState'
import { Container } from '../components/layout/Container'
import { LoadingSkeleton } from '../components/feedback/LoadingSkeleton'
import { ReviewList, type ReviewListItem } from '../components/reviews/ReviewList'
import { ButtonLink } from '../components/ui/ButtonLink'
import { PageMessage } from '../components/ui/PageMessage'
import { SectionHeader } from '../components/ui/SectionHeader'
import { useActivityDetails } from '../hooks/useActivityDetails'
import { useActivityReviews } from '../hooks/useActivityReviews'
import { paths } from '../routes/paths'
import { isNotFoundError } from '../services/apiError'
import { getErrorMessage } from '../utils/errorMessages'
import { formatReviewCount } from '../utils/format'
import { ActivityHeader } from './activity/ActivityHeader'

function ActivityNotFound() {
  return (
    <Container className="py-8">
      <PageMessage
        icon={MapPinOff}
        title="Atividade não encontrada"
        description="A atividade que você procurou não existe ou o endereço está incorreto."
        action={<ButtonLink to={paths.destinations}>Explorar destinos</ButtonLink>}
      />
    </Container>
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
      <section aria-label="Carregando atividade">
        <Container className="flex flex-col gap-8 py-8">
          <LoadingSkeleton variant="card" count={2} label="Carregando detalhes da atividade" />
        </Container>
      </section>
    )
  }

  if (activityQuery.isError || !activityQuery.data) {
    return (
      <Container className="py-8">
        <ErrorState
          message={getErrorMessage(activityQuery.error)}
          onRetry={() => void activityQuery.refetch()}
        />
      </Container>
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
    <>
      <ActivityHeader activity={activity} />

      <Container className="flex flex-col gap-16 py-12">
        <section aria-label="Avaliações" className="flex flex-col gap-6">
          <SectionHeader title="Avaliações">
            {activity.reviewCount > 0 && (
              <span className="text-body-sm text-gray-dim tabular">
                {formatReviewCount(activity.reviewCount)}
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
      </Container>
    </>
  )
}

/** Tela pública de detalhes da atividade (`/activities/:id`), com nota média e avaliações paginadas. */
export default function ActivityDetailsPage() {
  const { id = '' } = useParams<{ id: string }>()
  return <ActivityDetailsContent key={id} id={id} />
}
