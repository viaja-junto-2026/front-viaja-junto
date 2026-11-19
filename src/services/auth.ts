import { env } from '../config/env'
import { unwrap } from './apiError'
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

/** Usuário dono do token atual. Lança `ApiError` se a API recusar. */
export async function getCurrentUser(): Promise<User> {
  return unwrap(await apiClient.GET('/api/auth/me'))
}

/** Encerra a sessão no back-end, invalidando os tokens do usuário em todos os dispositivos. */
export async function logout(): Promise<void> {
  unwrap(await apiClient.POST('/api/auth/logout'))
}
