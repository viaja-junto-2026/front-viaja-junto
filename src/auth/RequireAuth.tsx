import { LockKeyhole } from 'lucide-react'
import { Outlet, useLocation } from 'react-router'
import { EmptyState } from '../components/feedback/EmptyState'
import { LoadingSkeleton } from '../components/feedback/LoadingSkeleton'
import { ButtonLink } from '../components/ui/ButtonLink'
import { paths } from '../routes/paths'
import { saveRedirectTarget } from '../services/session'
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

/** Guarda das rotas privadas: só mostra o conteúdo para quem está logado. */
export function RequireAuth() {
  const { status } = useAuth()

  if (status === 'loading') return <LoadingSkeleton />
  if (status === 'unauthenticated') return <SignInPrompt />
  return <Outlet />
}
