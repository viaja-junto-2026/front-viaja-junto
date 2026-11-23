import { ArrowLeft, MapPinOff } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { ErrorState } from '../components/feedback/ErrorState'
import { LoadingSkeleton } from '../components/feedback/LoadingSkeleton'
import { ReviewList } from '../components/reviews/ReviewList'
import { ButtonLink } from '../components/ui/ButtonLink'
import { IconCircle } from '../components/ui/IconCircle'
import { SectionHeader } from '../components/ui/SectionHeader'
import { focusRing } from '../components/ui/focus'
import { useDestinationDetails } from '../hooks/useDestinationDetails'
import { paths } from '../routes/paths'
import { ApiError } from '../services/apiError'
import { getErrorMessage } from '../utils/errorMessages'
import { DestinationActivitiesSection } from './destination/DestinationActivitiesSection'
import { DestinationHeader } from './destination/DestinationHeader'

/** Indica se o erro da API significa destino inexistente ou identificador inválido. */
function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 404 || error.status === 400)
}

function DestinationNotFound() {
  return (
    <section className="flex flex-col items-center gap-4 px-4 py-12 text-center">
      <IconCircle icon={MapPinOff} size="lg" />
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-headline-md text-red-burgundy lg:text-headline-lg">
          Destino não encontrado
        </h1>
        <p className="max-w-md text-body-md text-gray-dim">
          O destino que você procurou não existe ou o endereço está incorreto.
        </p>
      </div>
      <ButtonLink to={paths.destinations} variant="primary">
        Explorar destinos
      </ButtonLink>
    </section>
  )
}

function DestinationDetailsContent({ id }: { id: string }) {
  const destinationQuery = useDestinationDetails(id)

  if (!id || isNotFoundError(destinationQuery.error)) {
    return <DestinationNotFound />
  }

  if (destinationQuery.isLoading) {
    return (
      <section aria-label="Carregando destino" className="flex flex-col gap-8 py-8">
        <LoadingSkeleton variant="card" count={2} label="Carregando detalhes do destino" />
      </section>
    )
  }

  if (destinationQuery.isError || !destinationQuery.data) {
    return (
      <section className="py-8">
        <ErrorState
          message={getErrorMessage(destinationQuery.error)}
          onRetry={() => void destinationQuery.refetch()}
        />
      </section>
    )
  }

  const destination = destinationQuery.data

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

      <DestinationHeader destination={destination} />

      <DestinationActivitiesSection destinationId={destination.id} />

      <section aria-label="Avaliações" className="flex flex-col gap-6">
        <SectionHeader title="Avaliações">
          {destination.reviewCount > 0 && (
            <span className="text-body-sm text-gray-dim tabular">
              {destination.reviewCount === 1
                ? '1 avaliação'
                : `${destination.reviewCount} avaliações`}
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
    </div>
  )
}

/** Tela pública de detalhes do destino (`/destinations/:id`), com atividades filtráveis e avaliações. */
export default function DestinationDetailsPage() {
  const { id = '' } = useParams<{ id: string }>()
  return <DestinationDetailsContent key={id} id={id} />
}
