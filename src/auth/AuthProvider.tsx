import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getCurrentUser, logout, type User } from '../services/auth'
import { clearToken, getToken, saveToken, setUnauthorizedHandler } from '../services/session'
import { AuthContext, type AuthContextValue, type AuthStatus } from './authContext'

interface AuthState {
  status: AuthStatus
  user: User | null
  sessionExpired?: boolean
  sessionError?: unknown
}

const signedOut: AuthState = { status: 'unauthenticated', user: null }
const expired: AuthState = { ...signedOut, sessionExpired: true }

/** Mantém a sessão do usuário e a oferece para o app inteiro (use `useAuth`). */
export function AuthProvider({ children }: { children: ReactNode }) {
  // Com token guardado, é preciso confirmar na API quem é o usuário antes de mostrar o app.
  const [state, setState] = useState<AuthState>(() =>
    getToken() ? { status: 'loading', user: null } : signedOut,
  )

  // Muda a cada "Tentar de novo", para confirmar a sessão outra vez.
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true

    if (getToken()) {
      getCurrentUser()
        .then((user) => active && setState({ status: 'authenticated', user }))
        .catch((error: unknown) => {
          if (!active) return
          setState((current) => {
            // Se a falha foi um 401, o aviso de sessão expirada é mantido.
            if (current.sessionExpired) return current
            // Com o token ainda guardado, a falha foi da rede ou do servidor: dá para tentar de novo.
            return getToken() ? { ...signedOut, sessionError: error } : signedOut
          })
        })
    }

    // A API recusou o token (401): a sessão acabou.
    const removeHandler = setUnauthorizedHandler(() => setState(expired))

    return () => {
      active = false
      removeHandler()
    }
  }, [attempt])

  const retrySession = useCallback(() => {
    setState({ status: 'loading', user: null })
    setAttempt((current) => current + 1)
  }, [])

  const signIn = useCallback(async (token: string, expiresInSeconds?: number) => {
    saveToken(token, expiresInSeconds)
    setState({ status: 'loading', user: null })
    try {
      const user = await getCurrentUser()
      setState({ status: 'authenticated', user })
    } catch (error) {
      clearToken()
      setState(signedOut)
      throw error
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await logout()
    } catch {
      // Mesmo que a API falhe, o token é descartado neste navegador.
    } finally {
      clearToken()
      setState(signedOut)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, signIn, signOut, retrySession }),
    [state, signIn, signOut, retrySession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
