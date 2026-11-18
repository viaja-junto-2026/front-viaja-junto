import createClient from 'openapi-fetch'
import { env } from '../config/env'
import type { paths } from './generated/schema'
import { getToken, notifyUnauthorized } from './session'

/**
 * Único cliente HTTP do back-end. As rotas e os tipos vêm do contrato OpenAPI
 * (src/services/openapi.json), então o TypeScript acusa qualquer chamada inválida.
 * As telas nunca usam este cliente diretamente: elas chamam as funções de src/services/.
 */
export const apiClient = createClient<paths>({ baseUrl: env.apiUrl })

apiClient.use({
  // Envia o token da sessão (se houver) em todas as chamadas.
  onRequest({ request }) {
    const token = getToken()
    if (token) request.headers.set('Authorization', `Bearer ${token}`)
    return request
  },
  // Se a API recusar o token (401), a sessão é descartada e a interface é avisada.
  onResponse({ response }) {
    if (response.status === 401) notifyUnauthorized()
    return response
  },
})
