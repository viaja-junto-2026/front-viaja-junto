import { ArrowLeft, LogIn } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useLocation, useSearchParams } from 'react-router'
import logoVj from '../assets/logo-vj.png'
import { useAuth } from '../auth/useAuth'
import { LoadingSkeleton } from '../components/feedback/LoadingSkeleton'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { focusRing } from '../components/ui/focus'
import { paths } from '../routes/paths'
import { getGoogleLoginUrl } from '../services/auth'

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
    <main className="flex min-h-screen flex-col items-center justify-center bg-beige-light px-4 py-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Link
          to={paths.home}
          className={`inline-flex w-fit items-center gap-2 rounded-xs text-label-md text-red-burgundy transition-colors hover:text-red-ruby ${focusRing}`}
        >
          <ArrowLeft aria-hidden="true" size={20} />
          <span>Voltar para o início</span>
        </Link>

        <Card className="flex flex-col gap-6 border border-beige-sand shadow-lg">
          <div className="flex flex-col items-center gap-3 text-center">
            <img src={logoVj} alt="ViajaJunto" className="h-12 w-auto" />
            <div className="flex flex-col gap-1">
              <h1 className="font-heading text-headline-md text-red-burgundy lg:text-headline-lg">
                Entrar
              </h1>
              <p className="text-body-md text-gray-dim">
                Bem-vindo ao ViajaJunto! Entre com sua conta Google para planejar viagens em grupo,
                controlar o orçamento e compartilhar roteiros.
              </p>
            </div>
          </div>

          {errorMessage && <Alert variant="error">{errorMessage}</Alert>}

          {status === 'loading' ? (
            <LoadingSkeleton variant="text" count={2} label="Verificando sessão" />
          ) : (
            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
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
            </div>
          )}
        </Card>
      </div>
    </main>
  )
}
