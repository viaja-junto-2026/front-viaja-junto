import { env } from '../config/env'
import { apiClient } from './apiClient'
import type { components } from './generated/schema'

export type User = components['schemas']['UserResponseDto']

/**
 * Endereço que inicia o login com o Google. Precisa ser aberto com uma navegação de página
 * inteira (window.location), nunca com fetch: o redirecionamento para o Google é bloqueado por CORS.
 */
export function getGoogleLoginUrl(): string {
  return `${env.apiUrl}/api/auth/google`
}

/** Usuário dono do token atual. */
export async function getCurrentUser(): Promise<User> {
  const { data, response } = await apiClient.GET('/api/auth/me')
  if (!data) {
    throw new Error(`Failed to load the current user (HTTP ${response.status})`)
  }
  return data
}

/** Encerra a sessão no back-end, invalidando os tokens do usuário em todos os dispositivos. */
export async function logout(): Promise<void> {
  const { response } = await apiClient.POST('/api/auth/logout')
  if (!response.ok) {
    throw new Error(`Failed to sign out (HTTP ${response.status})`)
  }
}
