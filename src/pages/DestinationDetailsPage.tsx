import { MapPinOff } from 'lucide-react'
import { useParams } from 'react-router'
import { ErrorState } from '../components/feedback/ErrorState'
import { Container } from '../components/layout/Container'
import { LoadingSkeleton } from '../components/feedback/LoadingSkeleton'
import { ReviewList } from '../components/reviews/ReviewList'
import { ButtonLink } from '../components/ui/ButtonLink'
import { PageMessage } from '../components/ui/PageMessage'
import { SectionHeader } from '../components/ui/SectionHeader'
import { useDestinationDetails } from '../hooks/useDestinationDetails'
import { paths } from '../routes/paths'
import { isNotFoundError } from '../services/apiError'
import { getErrorMessage } from '../utils/errorMessages'
import { formatReviewCount } from '../utils/format'
import { DestinationActivitiesSection } from './destination/DestinationActivitiesSection'
import { DestinationHeader } from './destination/DestinationHeader'

function DestinationNotFound() {
  return (
    <Container className="py-8">
      <PageMessage
        icon={MapPinOff}
        title="Destino não encontrado"
        description="O destino que você procurou não existe ou o endereço está incorreto."
        action={<ButtonLink to={paths.destinations}>Explorar destinos</ButtonLink>}
      />
    </Container>
  )
}

function DestinationDetailsContent({ id }: { id: string }) {
  const destinationQuery = useDestinationDetails(id)

  if (!id || isNotFoundError(destinationQuery.error)) {
    return <DestinationNotFound />
  }

  if (destinationQuery.isLoading) {
    return (
      <section aria-label="Carregando destino">
        <Container className="flex flex-col gap-8 py-8">
          <LoadingSkeleton variant="card" count={2} label="Carregando detalhes do destino" />
        </Container>
      </section>
    )
  }

  if (destinationQuery.isError || !destinationQuery.data) {
    return (
      <Container className="py-8">
        <ErrorState
          message={getErrorMessage(destinationQuery.error)}
          onRetry={() => void destinationQuery.refetch()}
        />
      </Container>
    )
  }

  const destination = destinationQuery.data

  return (
    <>
      <DestinationHeader destination={destination} />

      <Container className="flex flex-col gap-16 py-12">
        <DestinationActivitiesSection destinationId={destination.id} />

        <section aria-label="Avaliações" className="flex flex-col gap-6">
          <SectionHeader title="Avaliações">
            {destination.reviewCount > 0 && (
              <span className="text-body-sm text-gray-dim tabular">
                {formatReviewCount(destination.reviewCount)}
              </span>
            )}
          </SectionHeader>

          <ReviewList
            items={destination.latestReviews}
            isLoading={false}
            isError={false}
            page={1}
            totalPages={1}
            hasPrevious={false}
            hasNext={false}
            onPageChange={() => {}}
          />
        </section>
      </Container>
    </>
  )
}

/** Tela pública de detalhes do destino (`/destinations/:id`), com atividades filtráveis e avaliações. */
export default function DestinationDetailsPage() {
  const { id = '' } = useParams<{ id: string }>()
  return <DestinationDetailsContent key={id} id={id} />
}
