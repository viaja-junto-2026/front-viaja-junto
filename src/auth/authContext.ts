import { createContext } from 'react'
import type { User } from '../services/auth'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export interface AuthContextValue {
  status: AuthStatus
  user: User | null
  /** A API recusou o token (401): as rotas privadas levam para o login. */
  sessionExpired?: boolean
  /** Há um token, mas não deu para confirmá-lo (API fora do ar, sem rede). */
  sessionError?: unknown
  /** Tenta confirmar a sessão de novo depois de um `sessionError`. */
  retrySession?: () => void
  /** Guarda o token recebido do login, confirma o usuário na API e abre a sessão. */
  signIn: (token: string, expiresInSeconds?: number) => Promise<void>
  /** Encerra a sessão no back-end e descarta o token. */
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
