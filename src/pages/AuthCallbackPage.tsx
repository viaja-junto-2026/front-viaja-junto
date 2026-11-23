import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import logoVj from '../assets/logo-vj.png'
import { useAuth } from '../auth/useAuth'
import { Spinner } from '../components/feedback/Spinner'
import { Alert } from '../components/ui/Alert'
import { ButtonLink } from '../components/ui/ButtonLink'
import { Card } from '../components/ui/Card'
import { paths } from '../routes/paths'
import { consumeRedirectTarget } from '../services/session'
import { getErrorMessage } from '../utils/errorMessages'

type CallbackToken = {
  token: string
  expiresInSeconds?: number
}

/** Lê `access_token`, `token_type` e `expires_in` do fragmento `#access_token=...` devolvido pelo back-end. */
function parseCallbackHash(hash: string): CallbackToken | null {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  if (!raw) return null
  const params = new URLSearchParams(raw)
  const token = params.get('access_token')?.trim()
  if (!token) return null

  const tokenType = params.get('token_type')?.trim()
  if (tokenType && tokenType.toLowerCase() !== 'bearer') return null

  const rawExpires = params.get('expires_in')
  const parsedExpires = rawExpires ? Number.parseInt(rawExpires, 10) : Number.NaN
  const expiresInSeconds =
    Number.isFinite(parsedExpires) && parsedExpires > 0 ? parsedExpires : undefined

  return { token, expiresInSeconds }
}

/**
 * Retorno do login com Google (`/auth/callback`): lê o token do fragmento da URL,
 * limpa o histórico, autentica a sessão (`/auth/me`) e redireciona para a página pedida ou `/trips`.
 */
export default function AuthCallbackPage() {
  const { signIn } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const handledRef = useRef(false)

  const [callbackToken] = useState<CallbackToken | null>(() => parseCallbackHash(location.hash))
  const [errorMessage, setErrorMessage] = useState<string | null>(() =>
    callbackToken ? null : 'Não recebemos o token de acesso. Tente entrar novamente.',
  )

  useEffect(() => {
    if (!callbackToken || handledRef.current) return
    handledRef.current = true

    // Limpa o fragmento da URL para que o token nunca permaneça visível ou no histórico.
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }

    signIn(callbackToken.token, callbackToken.expiresInSeconds)
      .then(() => {
        const target = consumeRedirectTarget() ?? paths.trips
        void navigate(target, { replace: true })
      })
      .catch((error: unknown) => {
        setErrorMessage(getErrorMessage(error))
      })
  }, [callbackToken, navigate, signIn])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-beige-light px-4 py-10">
      <Card className="flex w-full max-w-md flex-col items-center gap-6 border border-beige-sand text-center shadow-lg">
        <img src={logoVj} alt="ViajaJunto" className="h-12 w-auto" />
        <h1 className="font-heading text-headline-md text-red-burgundy">Entrando...</h1>

        {errorMessage ? (
          <div className="flex w-full flex-col gap-4 text-left">
            <Alert variant="error">{errorMessage}</Alert>
            <ButtonLink to={paths.login} variant="primary" fullWidth>
              Voltar para o login
            </ButtonLink>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Spinner label="Confirmando sua sessão" />
            <p className="text-body-md text-gray-dim">
              Estamos confirmando sua conta com o Google.
            </p>
          </div>
        )}
      </Card>
    </main>
  )
}
