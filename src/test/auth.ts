import { vi } from 'vitest'
import type { AuthContextValue } from '../auth/authContext'
import type { User } from '../services/auth'

export const testUser: User = {
  id: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
  name: 'Gustavo Fidelis',
  email: 'gustavo@exemplo.com',
  role: 'USER',
  createdAt: '2026-03-14T18:22:05.000Z',
}

/** Valor de autenticação para os testes: logado por padrão, com signIn e signOut espiões. */
export function makeAuthValue(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    status: 'authenticated',
    user: testUser,
    signIn: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}
