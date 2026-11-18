import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from './authContext'

/** Estado da sessão: usuário, status (`loading`, `authenticated`, `unauthenticated`), signIn e signOut. */
export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('useAuth must be used inside an AuthProvider')
  }
  return value
}
