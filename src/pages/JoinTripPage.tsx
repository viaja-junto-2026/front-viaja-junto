import { Ticket } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Container } from '../components/layout/Container'
import { JoinTripForm } from '../components/members/JoinTripForm'
import { BackLink } from '../components/ui/BackLink'
import { IconTile } from '../components/ui/IconTile'
import { PageBanner } from '../components/ui/PageBanner'
import { TicketCard } from '../components/ui/TicketCard'
import { paths } from '../routes/paths'

/** Entrar com código (`/join`): o convite em forma de cartão de embarque. */
export default function JoinTripPage() {
  const navigate = useNavigate()

  return (
    <>
      <PageBanner
        eyebrow="Convite"
        title="Entrar com código"
        description="Embarque no roteiro que o grupo já está montando."
      />
      <Container className="py-12">
        <div className="mx-auto flex max-w-md flex-col gap-6">
          <TicketCard
            stub={<JoinTripForm onJoined={(trip) => void navigate(paths.tripDetails(trip.id))} />}
          >
            <IconTile icon={Ticket} />
            <p className="text-body-md text-gray-dim">
              Peça o código a quem criou a viagem. Você entra como Visualizador, e quem criou pode
              te tornar Editor depois.
            </p>
          </TicketCard>
          <div className="self-center">
            <BackLink to={paths.trips}>Minhas viagens</BackLink>
          </div>
        </div>
      </Container>
    </>
  )
}
