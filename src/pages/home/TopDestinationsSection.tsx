import { Star } from 'lucide-react'
import { DestinationShowcaseCard } from '../../components/destinations/DestinationShowcaseCard'
import { EmptyState } from '../../components/feedback/EmptyState'
import { LoadingSkeleton } from '../../components/feedback/LoadingSkeleton'
import { QueryState } from '../../components/feedback/QueryState'
import { Container } from '../../components/layout/Container'
import { ButtonLink } from '../../components/ui/ButtonLink'
import { SectionTitle } from '../../components/ui/SectionTitle'
import { useTopDestinations } from '../../hooks/useTopDestinations'
import { paths } from '../../routes/paths'

const TITLE = 'Destinos mais bem avaliados'

/** Os três destinos mais bem avaliados, em cards, com carregando, erro e vazio. */
export function TopDestinationsSection() {
  const { data, isLoading, isError, error, refetch } = useTopDestinations(3)
  const destinations = data ?? []

  return (
    <section aria-label={TITLE}>
      <Container className="flex flex-col gap-10 py-16">
        <SectionTitle eyebrow="Para onde ir" title={TITLE} />
        <QueryState
          isLoading={isLoading}
          isError={isError}
          isEmpty={!isLoading && !isError && destinations.length === 0}
          error={error}
          onRetry={() => void refetch()}
          loading={<LoadingSkeleton variant="card" count={3} label="Carregando destinos" />}
          empty={
            <EmptyState
              icon={Star}
              title="Ainda não há destinos avaliados"
              description="Conclua uma viagem e seja a primeira pessoa a avaliar um destino."
            />
          }
        >
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((destination) => (
              <li key={destination.id}>
                <DestinationShowcaseCard destination={destination} />
              </li>
            ))}
          </ul>
        </QueryState>
        <div className="flex justify-center">
          <ButtonLink to={paths.destinations} variant="outline">
            Ver todos os destinos
          </ButtonLink>
        </div>
      </Container>
    </section>
  )
}
