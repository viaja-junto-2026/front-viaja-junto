import { useState } from 'react'
import { getErrorMessage } from '../../utils/errorMessages'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { ConfirmDialog } from '../ui/ConfirmDialog'

type DeleteTripSectionProps = {
  tripName: string
  deleting?: boolean
  /** Erro da última tentativa de excluir (403, 404, rede...). */
  error?: unknown
  onDelete: () => void
}

/** Bloco de exclusão da viagem, sempre com confirmação antes de apagar. */
export function DeleteTripSection({ tripName, deleting, error, onDelete }: DeleteTripSectionProps) {
  const [confirming, setConfirming] = useState(false)

  return (
    <Card
      as="section"
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-title-md text-brown-espresso">Excluir viagem</h2>
        <p className="text-body-sm text-gray-dim">
          Apaga a viagem e tudo o que é dela. Não dá para desfazer.
        </p>
      </div>
      <Button variant="danger" onClick={() => setConfirming(true)}>
        Excluir viagem
      </Button>

      <ConfirmDialog
        open={confirming}
        title="Excluir esta viagem?"
        description={
          <div className="flex flex-col gap-3">
            <p>
              A viagem “{tripName}” será apagada para todo o grupo, com os destinos, as atividades,
              o orçamento e os membros. Não dá para desfazer.
            </p>
            {Boolean(error) && <Alert variant="error">{getErrorMessage(error)}</Alert>}
          </div>
        }
        confirmLabel="Excluir"
        loading={deleting}
        onConfirm={onDelete}
        onCancel={() => setConfirming(false)}
      />
    </Card>
  )
}
