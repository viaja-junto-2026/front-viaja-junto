import { LogIn } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useLocation, useSearchParams } from 'react-router'
import { useAuth } from '../auth/useAuth'
import { LoadingSkeleton } from '../components/feedback/LoadingSkeleton'
import { AuthShell } from '../components/layout/AuthShell'
import { BrandLogo } from '../components/layout/BrandLogo'
import { Alert } from '../components/ui/Alert'
import { BackLink } from '../components/ui/BackLink'
import { Button } from '../components/ui/Button'
import { CompassDivider } from '../components/ui/CompassDivider'
import { TicketCard } from '../components/ui/TicketCard'
import { paths } from '../routes/paths'
import { getGoogleLoginUrl } from '../services/auth'
import { DisplayTitle } from '../components/ui/DisplayTitle'

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'O login com o Google foi cancelado. Tente novamente quando quiser.',
  missing_token: 'Não foi possível concluir o login com o Google. Tente novamente.',
  invalid_token: 'Sua sessão não pôde ser validada. Tente entrar novamente.',
}

type LoginLocationState = {
  error?: string
}

/**
 * Tela de login (`/login`), fora do layout principal.
 * Quem já está logado é redirecionado para `/trips`. O login é feito apenas com o Google
 * por navegação de página inteira (`window.location.assign`), nunca com `fetch`.
 */
export default function LoginPage() {
  const { status } = useAuth()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [isRedirecting, setIsRedirecting] = useState(false)

  if (status === 'authenticated') {
    return <Navigate to={paths.trips} replace />
  }

  const stateError = (location.state as LoginLocationState | null)?.error
  const queryError = searchParams.get('error')
  const errorMessage =
    stateError ??
    (queryError
      ? (ERROR_MESSAGES[queryError] ?? 'Não foi possível concluir o login. Tente novamente.')
      : null)

  function handleGoogleLogin() {
    setIsRedirecting(true)
    // Navegação de página inteira: o redirecionamento para o Google não pode usar fetch (CORS).
    window.location.assign(getGoogleLoginUrl())
  }

  return (
    <AuthShell>
      <BackLink to={paths.home}>Voltar para o início</BackLink>

      <TicketCard
        stub={
          <>
            {errorMessage && <Alert variant="error">{errorMessage}</Alert>}

            {status === 'loading' ? (
              <LoadingSkeleton variant="text" count={2} label="Verificando sessão" />
            ) : (
              <>
                <Button
                  variant="solid"
                  fullWidth
                  loading={isRedirecting}
                  leftIcon={<LogIn aria-hidden="true" size={20} />}
                  onClick={handleGoogleLogin}
                >
                  Entrar com o Google
                </Button>
                <p className="text-center text-body-sm text-gray-dim">
                  Não é preciso criar senha: sua conta é vinculada diretamente ao Google.
                </p>
              </>
            )}
          </>
        }
      >
        <BrandLogo />
        <DisplayTitle size="page">Entrar</DisplayTitle>
        <CompassDivider />
        <p className="text-body-md text-gray-dim">
          Bem-vindo ao ViajaJunto! Entre com sua conta Google para planejar viagens em grupo,
          controlar o orçamento e compartilhar roteiros.
        </p>
      </TicketCard>
    </AuthShell>
  )
}
