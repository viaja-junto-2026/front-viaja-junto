import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getCurrentUser, logout, type User } from '../services/auth'
import { clearToken, getToken, saveToken, setUnauthorizedHandler } from '../services/session'
import { AuthContext, type AuthContextValue, type AuthStatus } from './authContext'

interface AuthState {
  status: AuthStatus
  user: User | null
}

const signedOut: AuthState = { status: 'unauthenticated', user: null }

/** Mantém a sessão do usuário e a oferece para o app inteiro (use `useAuth`). */
export function AuthProvider({ children }: { children: ReactNode }) {
  // Com token guardado, é preciso confirmar na API quem é o usuário antes de mostrar o app.
  const [state, setState] = useState<AuthState>(() =>
    getToken() ? { status: 'loading', user: null } : signedOut,
  )

  useEffect(() => {
    let active = true

    if (getToken()) {
      getCurrentUser()
        .then((user) => active && setState({ status: 'authenticated', user }))
        .catch(() => active && setState(signedOut))
    }

    // A API recusou o token (401): a sessão acabou.
    const removeHandler = setUnauthorizedHandler(() => setState(signedOut))

    return () => {
      active = false
      removeHandler()
    }
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
    () => ({ ...state, signIn, signOut }),
    [state, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
