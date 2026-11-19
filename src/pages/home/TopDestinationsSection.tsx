import { Star } from 'lucide-react'
import { DestinationCard } from '../../components/destinations/DestinationCard'
import { EmptyState } from '../../components/feedback/EmptyState'
import { LoadingSkeleton } from '../../components/feedback/LoadingSkeleton'
import { QueryState } from '../../components/feedback/QueryState'
import { ButtonLink } from '../../components/ui/ButtonLink'
import { Carousel } from '../../components/ui/Carousel'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { TextLink } from '../../components/ui/TextLink'
import { useTopDestinations } from '../../hooks/useTopDestinations'
import { paths } from '../../routes/paths'

const TITLE = 'Destinos mais bem avaliados'

/** Faixa "Destinos mais bem avaliados": carrossel de cards, com carregando, erro e vazio. */
export function TopDestinationsSection() {
  const { data, isLoading, isError, error, refetch } = useTopDestinations()
  const destinations = data ?? []
  const seeAll = <TextLink to={paths.destinations}>Ver todas</TextLink>

  if (destinations.length > 0) {
    return (
      <Carousel title={TITLE} action={seeAll}>
        {destinations.map((destination) => (
          <DestinationCard
            key={destination.id}
            destination={destination}
            className="w-64 sm:w-72"
          />
        ))}
      </Carousel>
    )
  }

  return (
    <section aria-label={TITLE} className="flex flex-col gap-6">
      <SectionHeader title={TITLE}>{seeAll}</SectionHeader>
      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!isLoading && !isError}
        error={error}
        onRetry={() => void refetch()}
        loading={<LoadingSkeleton variant="photo" count={4} label="Carregando destinos" />}
        empty={
          <EmptyState
            icon={Star}
            title="Ainda não há destinos avaliados"
            description="Conclua uma viagem e seja a primeira pessoa a avaliar um destino."
            action={
              <ButtonLink to={paths.destinations} variant="secondary">
                Explorar destinos
              </ButtonLink>
            }
          />
        }
      >
        {null}
      </QueryState>
    </section>
  )
}
