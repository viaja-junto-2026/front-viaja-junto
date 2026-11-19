import type { ReactNode } from 'react'
import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'
import { LoadingSkeleton } from './LoadingSkeleton'

type QueryStateProps = {
  isLoading: boolean
  isError: boolean
  /** Sem itens para mostrar (veja `isEmpty` de `usePaginatedQuery`). */
  isEmpty?: boolean
  /** Refaz a chamada: ligado ao botão "Tentar de novo". */
  onRetry?: () => void
  /** Mensagem de erro em português (opcional). */
  errorMessage?: string
  /** Substitui o skeleton padrão. */
  loading?: ReactNode
  /** Substitui o estado vazio padrão (use um `EmptyState` com a ação da tela). */
  empty?: ReactNode
  /** O conteúdo, mostrado só quando há dados. */
  children: ReactNode
}

/**
 * Escolhe o que a tela mostra: carregando, erro, vazio ou o conteúdo, nessa ordem.
 * Uma tela só precisa passar os estados do hook e o conteúdo.
 */
export function QueryState({
  isLoading,
  isError,
  isEmpty = false,
  onRetry,
  errorMessage,
  loading,
  empty,
  children,
}: QueryStateProps) {
  if (isLoading) return <>{loading ?? <LoadingSkeleton />}</>
  if (isError) return <ErrorState message={errorMessage} onRetry={onRetry} />
  if (isEmpty) return <>{empty ?? <EmptyState title="Nada por aqui ainda" />}</>
  return <>{children}</>
}
