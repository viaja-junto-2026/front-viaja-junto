import createClient from 'openapi-fetch'
import { env } from '../config/env'
import type { paths } from './generated/schema'

/**
 * Único cliente HTTP do back-end. As rotas e os tipos vêm do contrato OpenAPI
 * (src/services/openapi.json), então o TypeScript acusa qualquer chamada inválida.
 * As telas nunca usam este cliente diretamente: elas chamam as funções de src/services/.
 */
export const apiClient = createClient<paths>({ baseUrl: env.apiUrl })
