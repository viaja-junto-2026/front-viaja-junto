import { Copy, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { useInviteCode } from '../../hooks/useInviteCode'
import { getErrorMessage } from '../../utils/errorMessages'
import { ErrorState } from '../feedback/ErrorState'
import { LoadingSkeleton } from '../feedback/LoadingSkeleton'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { Card, CardTitle } from '../ui/Card'
import { ConfirmDialog } from '../ui/ConfirmDialog'

type CopyResult = 'copied' | 'failed'

/** Código de convite da viagem, para quem a criou: copiar ou trocar por um novo. */
export function InviteCodeCard({ tripId }: { tripId: string }) {
  const { invite, regenerate } = useInviteCode(tripId)
  const [copyResult, setCopyResult] = useState<CopyResult>()
  const [confirming, setConfirming] = useState(false)

  async function copy(code: string) {
    try {
      await navigator.clipboard.writeText(code)
      setCopyResult('copied')
    } catch {
      // Sem permissão ou em um endereço sem HTTPS, o navegador não deixa copiar.
      setCopyResult('failed')
    }
  }

  function closeConfirmation() {
    setConfirming(false)
    regenerate.reset()
  }

  return (
    <Card as="section" aria-label="Convite" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <CardTitle>Convide o grupo</CardTitle>
        <p className="text-body-md text-gray-dim">
          Quem entra com o código começa como Visualizador.
        </p>
      </div>

      {invite.isError ? (
        <ErrorState message={getErrorMessage(invite.error)} onRetry={() => void invite.refetch()} />
      ) : !invite.data ? (
        <LoadingSkeleton variant="text" count={2} label="Carregando código de convite" />
      ) : (
        <>
          {/* Selecionável com um toque, para copiar à mão se o botão não funcionar. */}
          <p className="rounded-xs border border-dashed border-red-ruby bg-beige-light px-4 py-4 text-center">
            <span className="sr-only">Código de convite: </span>
            <span className="tabular text-numeric-lg tracking-widest text-brown-espresso select-all">
              {invite.data}
            </span>
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="solid"
              leftIcon={<Copy aria-hidden="true" size={16} />}
              onClick={() => void copy(invite.data)}
            >
              Copiar código
            </Button>
            <Button
              variant="outline"
              leftIcon={<RefreshCw aria-hidden="true" size={16} />}
              onClick={() => setConfirming(true)}
            >
              Gerar novo código
            </Button>
          </div>
          {copyResult === 'copied' && <Alert variant="success">Código copiado.</Alert>}
          {copyResult === 'failed' && (
            <Alert variant="warning">Não deu para copiar. Selecione o código acima e copie.</Alert>
          )}
        </>
      )}

      <ConfirmDialog
        open={confirming}
        title="Gerar um novo código?"
        confirmLabel="Gerar novo"
        description={
          <div className="flex flex-col gap-3">
            <p>O código atual para de funcionar. Quem já entrou continua na viagem.</p>
            {regenerate.isError && (
              <Alert variant="error">{getErrorMessage(regenerate.error)}</Alert>
            )}
          </div>
        }
        loading={regenerate.isPending}
        onConfirm={() =>
          regenerate.mutate(undefined, {
            onSuccess: () => {
              setCopyResult(undefined)
              setConfirming(false)
            },
          })
        }
        onCancel={closeConfirmation}
      />
    </Card>
  )
}
