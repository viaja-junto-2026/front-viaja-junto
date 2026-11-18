import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { paths } from '../routes/paths'
import { saveRedirectTarget } from '../services/session'
import { useAuth } from './useAuth'

/** Leva para o login e guarda a página pedida, para voltar a ela depois de entrar. */
function RedirectToLogin() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    saveRedirectTarget(location.pathname + location.search + location.hash)
    navigate(paths.login, { replace: true, state: { from: location } })
  }, [location, navigate])

  return null
}

/** Guarda das rotas privadas: só mostra o conteúdo para quem está logado. */
export function RequireAuth() {
  const { status } = useAuth()

  if (status === 'loading') {
    // Provisório: trocar pelo componente de carregamento da issue de estados compartilhados.
    return (
      <p role="status" className="py-8 text-body-md text-gray-dim">
        Carregando...
      </p>
    )
  }

  if (status === 'unauthenticated') {
    return <RedirectToLogin />
  }

  return <Outlet />
}
