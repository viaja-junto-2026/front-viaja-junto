import {
  Lock,
  MapPin,
  MapPinOff,
  Moon,
  Pencil,
  Ticket,
  UserRound,
  Users,
  Wallet,
} from 'lucide-react'
import { useParams } from 'react-router'
import { EmptyState } from '../components/feedback/EmptyState'
import { ErrorState } from '../components/feedback/ErrorState'
import { LoadingSkeleton } from '../components/feedback/LoadingSkeleton'
import { Container } from '../components/layout/Container'
import { TripStatusBadge } from '../components/trips/TripStatusBadge'
import { BackLink } from '../components/ui/BackLink'
import { BandOverlap } from '../components/ui/BandOverlap'
import { ButtonLink } from '../components/ui/ButtonLink'
import { FilterPanel } from '../components/ui/FilterPanel'
import { PageBanner } from '../components/ui/PageBanner'
import { PageMessage } from '../components/ui/PageMessage'
import { StatPanel } from '../components/ui/StatPanel'
import { Tabs } from '../components/ui/Tabs'
import { useTrip } from '../hooks/useTrip'
import { useTripRoute } from '../hooks/useTripRoute'
import { paths } from '../routes/paths'
import { ApiError, isNotFoundError } from '../services/apiError'
import type { Trip } from '../services/trips'
import { getErrorMessage } from '../utils/errorMessages'
import { formatDateRange, nightsBetween } from '../utils/format'
import { memberRoleLabels } from '../utils/labels'
import { ItineraryTab } from './trip/ItineraryTab'

const backToTrips = <ButtonLink to={paths.trips}>Voltar para minhas viagens</ButtonLink>

function TripContent({ trip }: { trip: Trip }) {
  const route = useTripRoute(trip.id)
  const { startDate, endDate } = trip
  const hasDates = Boolean(startDate && endDate)
  // Enquanto o roteiro não chega (ou se falhar), as contagens ficam com um traço.
  const known = !route.isLoading && !route.isError

  return (
    <>
      <PageBanner
        eyebrow="Sua viagem"
        title={trip.name}
        description={hasDates ? formatDateRange(startDate!, endDate!) : 'Datas a definir'}
      >
        <div className="flex flex-col items-center gap-3">
          {trip.description && <p className="max-w-lg text-body-md">{trip.description}</p>}
          <TripStatusBadge status={trip.status} />
          <div className="flex flex-wrap items-center justify-center gap-4">
            <BackLink to={paths.trips}>Minhas viagens</BackLink>
            {trip.role === 'OWNER' && (
              <ButtonLink
                to={paths.tripEdit(trip.id)}
                variant="outline"
                leftIcon={<Pencil aria-hidden="true" size={16} />}
              >
                Editar viagem
              </ButtonLink>
            )}
          </div>
        </div>
      </PageBanner>

      <BandOverlap>
        <FilterPanel>
          <StatPanel
            label="Resumo da viagem"
            stats={[
              {
                label: 'Noites',
                value: hasDates ? nightsBetween(startDate!, endDate!) : '–',
                icon: Moon,
              },
              { label: 'Destinos', value: known ? route.stops.length : '–', icon: MapPin },
              { label: 'Atividades', value: known ? route.activityCount : '–', icon: Ticket },
              { label: 'Seu papel', value: memberRoleLabels[trip.role], icon: UserRound },
            ]}
          />
        </FilterPanel>
      </BandOverlap>

      <Container className="py-8 sm:py-12">
        <Tabs
          label="Seções da viagem"
          tabs={[
            {
              id: 'itinerary',
              label: 'Roteiro',
              content: <ItineraryTab trip={trip} route={route} />,
            },
            {
              id: 'budget',
              label: 'Orçamento',
              content: (
                <EmptyState
                  icon={Wallet}
                  plainIcon
                  title="O orçamento chega em breve"
                  description="Aqui o grupo vai acompanhar o total, o que já foi planejado e o saldo."
                />
              ),
            },
            {
              id: 'members',
              label: 'Membros',
              content: (
                <EmptyState
                  icon={Users}
                  plainIcon
                  title="Os membros chegam em breve"
                  description="Aqui vão aparecer quem participa da viagem e o convite por código."
                />
              ),
            },
          ]}
        />
      </Container>
    </>
  )
}

function TripDetails({ id }: { id: string }) {
  const tripQuery = useTrip(id)

  if (isNotFoundError(tripQuery.error)) {
    return (
      <Container className="py-8">
        <PageMessage
          icon={MapPinOff}
          title="Viagem não encontrada"
          description="Ela pode ter sido excluída, ou o endereço está incorreto."
          action={backToTrips}
        />
      </Container>
    )
  }

  if (tripQuery.error instanceof ApiError && tripQuery.error.status === 403) {
    return (
      <Container className="py-8">
        <PageMessage
          icon={Lock}
          title="Você não participa desta viagem"
          description="Peça o código de convite a quem criou a viagem para entrar nela."
          action={backToTrips}
        />
      </Container>
    )
  }

  if (tripQuery.data) return <TripContent trip={tripQuery.data} />

  return (
    <Container className="py-12">
      {tripQuery.isError ? (
        <ErrorState
          message={getErrorMessage(tripQuery.error)}
          onRetry={() => void tripQuery.refetch()}
        />
      ) : (
        <LoadingSkeleton variant="card" count={3} label="Carregando viagem" />
      )}
    </Container>
  )
}

/** Página da viagem (`/trips/:id`): resumo, abas e o roteiro. */
export default function TripDetailsPage() {
  const { id = '' } = useParams<{ id: string }>()
  return <TripDetails key={id} id={id} />
}
