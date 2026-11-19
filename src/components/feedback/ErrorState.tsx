import { CircleAlert, RotateCw } from 'lucide-react'
import { Button } from '../ui/Button'

type ErrorStateProps = {
  title?: string
  /** Mensagem em português que diga o que fazer. */
  message?: string
  /** Refaz a chamada. Sem ele, o botão "Tentar de novo" não aparece. */
  onRetry?: () => void
  /** Mostra o carregamento no botão enquanto a nova tentativa roda. */
  retrying?: boolean
}

/** Erro ao carregar dados: ícone, mensagem em pt-BR e o botão "Tentar de novo". */
export function ErrorState({
  title = 'Algo deu errado',
  message = 'Não foi possível carregar os dados. Verifique sua conexão e tente de novo.',
  onRetry,
  retrying = false,
}: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-4 px-4 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-rose-blush text-red-burgundy">
        <CircleAlert aria-hidden="true" size={28} />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-headline-sm text-red-burgundy">{title}</h2>
        <p className="max-w-md text-body-md text-gray-dim">{message}</p>
      </div>
      {onRetry && (
        <Button
          variant="secondary"
          loading={retrying}
          leftIcon={<RotateCw aria-hidden="true" size={20} />}
          onClick={onRetry}
        >
          Tentar de novo
        </Button>
      )}
    </div>
  )
}
