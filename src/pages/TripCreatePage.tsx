import { useNavigate } from 'react-router'
import { Container } from '../components/layout/Container'
import { TripForm } from '../components/trips/TripForm'
import { emptyTrip } from '../components/trips/tripFormValues'
import { PageBanner } from '../components/ui/PageBanner'
import { useCreateTrip } from '../hooks/useTripMutations'
import { paths } from '../routes/paths'

/** Nova viagem (`/trips/new`). Depois de criar, vai para a página da viagem. */
export default function TripCreatePage() {
  const navigate = useNavigate()
  const create = useCreateTrip((trip) => void navigate(paths.tripDetails(trip.id)))

  return (
    <>
      <PageBanner
        eyebrow="Novo roteiro"
        title="Nova viagem"
        description="Dê um nome ao plano e diga quando ele acontece. O resto o grupo monta junto."
      />
      <Container className="py-12">
        <div className="mx-auto max-w-2xl">
          <TripForm
            initialValues={emptyTrip}
            submitLabel="Criar viagem"
            cancelTo={paths.trips}
            submitting={create.isPending}
            error={create.error}
            onSubmit={(values) => create.mutate(values)}
          />
        </div>
      </Container>
    </>
  )
}
