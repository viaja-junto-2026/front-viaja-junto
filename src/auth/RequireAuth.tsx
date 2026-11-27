import { LockKeyhole } from 'lucide-react'
import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { EmptyState } from '../components/feedback/EmptyState'
import { ErrorState } from '../components/feedback/ErrorState'
import { LoadingSkeleton } from '../components/feedback/LoadingSkeleton'
import { ButtonLink } from '../components/ui/ButtonLink'
import { paths } from '../routes/paths'
import { saveRedirectTarget } from '../services/session'
import { getErrorMessage } from '../utils/errorMessages'
import { useAuth } from './useAuth'

/**
 * Aviso para quem não entrou: a página continua dentro do layout (com a barra e a aba
 * ativa) e o botão leva ao login, guardando a página pedida para voltar a ela depois.
 */
function SignInPrompt() {
  const location = useLocation()

  return (
    <EmptyState
      icon={LockKeyhole}
      title="Entre para continuar"
      description="Esta página é só para quem tem conta. Entre com o Google para ver tudo o que é seu."
      action={
        <ButtonLink
          to={paths.login}
          state={{ from: location }}
          onClick={() => saveRedirectTarget(location.pathname + location.search + location.hash)}
        >
          Entrar
        </ButtonLink>
      }
    />
  )
}

/** Sessão que acabou no meio do uso: vai direto ao login e volta para a mesma página depois. */
function ExpiredSessionRedirect() {
  const location = useLocation()
  const target = location.pathname + location.search + location.hash

  useEffect(() => saveRedirectTarget(target), [target])

  return (
    <Navigate
      to={paths.login}
      replace
      state={{ error: 'Sua sessão expirou. Entre de novo para continuar.' }}
    />
  )
}

/** Guarda das rotas privadas: só mostra o conteúdo para quem está logado. */
export function RequireAuth() {
  const { status, sessionExpired, sessionError, retrySession } = useAuth()

  if (status === 'authenticated') return <Outlet />
  if (status === 'unauthenticated' && sessionExpired) return <ExpiredSessionRedirect />

  return (
    <>
      {status === 'loading' ? (
        <LoadingSkeleton />
      ) : sessionError ? (
        <ErrorState message={getErrorMessage(sessionError)} onRetry={retrySession} />
      ) : (
        <SignInPrompt />
      )}
    </>
  )
}
