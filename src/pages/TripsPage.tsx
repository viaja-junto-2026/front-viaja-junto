import { Plane, Plus, Ticket } from 'lucide-react'
import { EmptyState } from '../components/feedback/EmptyState'
import { LoadingSkeleton } from '../components/feedback/LoadingSkeleton'
import { QueryState } from '../components/feedback/QueryState'
import { Container } from '../components/layout/Container'
import { TripCard } from '../components/trips/TripCard'
import { BandOverlap } from '../components/ui/BandOverlap'
import { Button } from '../components/ui/Button'
import { ButtonLink } from '../components/ui/ButtonLink'
import { PageBanner } from '../components/ui/PageBanner'
import { Pagination } from '../components/ui/Pagination'
import { useTrips } from '../hooks/useTrips'
import { paths } from '../routes/paths'
import { TripsStatusFilter } from './trips/TripsStatusFilter'

function NewTripLink() {
  return (
    <ButtonLink to={paths.tripNew} variant="solid" leftIcon={<Plus aria-hidden="true" size={20} />}>
      Nova viagem
    </ButtonLink>
  )
}

/** Minhas viagens (`/trips`): as viagens do usuário, com filtro por status e paginação. */
export default function TripsPage() {
  const trips = useTrips()

  return (
    <>
      <PageBanner
        eyebrow="Seus roteiros"
        title="Minhas viagens"
        description="Acompanhe o que está sendo planejado, o que já foi confirmado e o que ficou na memória."
      >
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <NewTripLink />
          <ButtonLink
            to={paths.join}
            variant="outline"
            leftIcon={<Ticket aria-hidden="true" size={20} />}
          >
            Entrar com código
          </ButtonLink>
        </div>
      </PageBanner>

      <BandOverlap>
        <TripsStatusFilter status={trips.status} onChange={trips.setStatus} />
      </BandOverlap>

      <Container className="py-12">
        <QueryState
          isLoading={trips.isLoading}
          isError={trips.isError}
          isEmpty={trips.isEmpty}
          error={trips.error}
          onRetry={() => void trips.refetch()}
          loading={<LoadingSkeleton variant="card" count={3} label="Carregando viagens" />}
          empty={
            trips.status ? (
              <EmptyState
                icon={Plane}
                title="Nenhuma viagem com esse status"
                description="Escolha outro status ou veja todas as suas viagens."
                action={
                  <Button variant="secondary" onClick={() => trips.setStatus(undefined)}>
                    Ver todas
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={Plane}
                title="Você ainda não tem viagens. Crie a primeira!"
                action={<NewTripLink />}
              />
            )
          }
        >
          <div className="flex flex-col gap-8">
            <ul
              aria-label="Lista de viagens"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {trips.items.map((trip) => (
                <li key={trip.id}>
                  <TripCard trip={trip} />
                </li>
              ))}
            </ul>

            <Pagination
              label="Paginação das viagens"
              page={trips.page}
              totalPages={trips.meta?.totalPages}
              hasPrevious={trips.hasPrevious}
              hasNext={trips.hasNext}
              busy={trips.isFetching}
              onPageChange={trips.setPage}
            />
          </div>
        </QueryState>
      </Container>
    </>
  )
}
