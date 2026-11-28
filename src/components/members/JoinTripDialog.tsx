import { useNavigate } from 'react-router'
import { paths } from '../../routes/paths'
import { Modal } from '../ui/Modal'
import { JoinTripForm } from './JoinTripForm'

/** Janela de "Entrar com código", aberta em Minhas viagens. Ao entrar, abre a viagem. */
export function JoinTripDialog({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()

  return (
    <Modal open onClose={onClose} title="Entrar com código">
      <div className="flex flex-col gap-5">
        <p className="text-body-md text-gray-dim">
          Peça o código a quem criou a viagem. Você entra como Visualizador.
        </p>
        <JoinTripForm
          onCancel={onClose}
          onJoined={(trip) => void navigate(paths.tripDetails(trip.id))}
        />
      </div>
    </Modal>
  )
}
