import { Lock, MapPinOff } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import { ErrorState } from '../components/feedback/ErrorState'
import { LoadingSkeleton } from '../components/feedback/LoadingSkeleton'
import { Container } from '../components/layout/Container'
import { DeleteTripSection } from '../components/trips/DeleteTripSection'
import { TripForm } from '../components/trips/TripForm'
import { toTripInput } from '../components/trips/tripFormValues'
import { ButtonLink } from '../components/ui/ButtonLink'
import { PageBanner } from '../components/ui/PageBanner'
import { PageMessage } from '../components/ui/PageMessage'
import { useTrip } from '../hooks/useTrip'
import { useDeleteTrip, useUpdateTrip } from '../hooks/useTripMutations'
import { useTripStops } from '../hooks/useTripStops'
import { paths } from '../routes/paths'
import { ApiError, isNotFoundError } from '../services/apiError'
import type { Trip, TripInput } from '../services/trips'
import { getErrorMessage } from '../utils/errorMessages'
import { stopsOutsideTrip } from '../utils/schedule'

const backToTrips = <ButtonLink to={paths.trips}>Voltar para minhas viagens</ButtonLink>

function EditBanner() {
  return (
    <PageBanner
      eyebrow="Ajustar roteiro"
      title="Editar viagem"
      description="Mude o nome, as datas ou o status. O grupo vê a versão nova na hora."
    />
  )
}

function NotAllowed() {
  return (
    <Container className="py-8">
      <PageMessage
        icon={Lock}
        title="Só quem criou pode editar"
        description="Você participa de viagens de outras pessoas, mas só quem criou cada uma pode editar ou excluir."
        action={backToTrips}
      />
    </Container>
  )
}

function EditTrip({ trip }: { trip: Trip }) {
  const navigate = useNavigate()
  const stops = useTripStops(trip.id)

  /** A API aceitaria, mas depois recusaria qualquer edição nos destinos que ficassem de fora. */
  function checkDates({ startDate, endDate }: TripInput): string | undefined {
    const all = stops.data ?? []
    // Só os que a mudança passaria a deixar de fora; o resto não impede salvar.
    const before = stopsOutsideTrip(all, trip.startDate, trip.endDate)
    const outside = stopsOutsideTrip(all, startDate, endDate).filter(
      (stop) => !before.includes(stop),
    ).length
    if (outside === 0) return undefined
    const subject = outside === 1 ? '1 destino ficaria' : `${outside} destinos ficariam`
    return `Com essas datas, ${subject} fora da viagem. Antes, ajuste as datas no roteiro.`
  }

  const update = useUpdateTrip(trip.id, () => void navigate(paths.trips))
  const remove = useDeleteTrip(trip.id, () => void navigate(paths.trips, { replace: true }))

  return (
    <>
      <EditBanner />
      <Container className="py-12">
        <div className="mx-auto flex max-w-2xl flex-col gap-8">
          <TripForm
            initialValues={toTripInput(trip)}
            submitLabel="Salvar alterações"
            cancelTo={paths.trips}
            // Só dá para salvar depois de saber onde estão os destinos.
            submitting={update.isPending || stops.isLoading}
            error={update.error}
            checkDates={checkDates}
            onSubmit={(values) => update.mutate(values)}
          />
          <DeleteTripSection
            tripName={trip.name}
            deleting={remove.isPending}
            error={remove.error}
            onDelete={() => remove.mutate()}
          />
        </div>
      </Container>
    </>
  )
}

function TripEditContent({ id }: { id: string }) {
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

  if (tripQuery.error instanceof ApiError && tripQuery.error.status === 403) return <NotAllowed />

  if (tripQuery.data) {
    // Só o criador edita e exclui: a API responde 403 para os demais.
    return tripQuery.data.role === 'OWNER' ? <EditTrip trip={tripQuery.data} /> : <NotAllowed />
  }

  return (
    <>
      <EditBanner />
      <Container className="py-12">
        {tripQuery.isError ? (
          <ErrorState
            message={getErrorMessage(tripQuery.error)}
            onRetry={() => void tripQuery.refetch()}
          />
        ) : (
          <LoadingSkeleton variant="card" count={2} label="Carregando viagem" />
        )}
      </Container>
    </>
  )
}

/** Editar e excluir viagem (`/trips/:id/edit`), só para quem a criou. */
export default function TripEditPage() {
  const { id = '' } = useParams<{ id: string }>()
  return <TripEditContent key={id} id={id} />
}
