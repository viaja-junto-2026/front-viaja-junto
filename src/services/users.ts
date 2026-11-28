import { apiClient } from './apiClient'
import { unwrap } from './apiError'

/**
 * Só o nome de uma pessoa. A API também devolve e-mail e outros dados da conta: eles são
 * descartados aqui, para não irem ao cache nem à tela.
 */
export async function getUserName(id: string): Promise<string> {
  const { name } = unwrap(await apiClient.GET('/api/users/{id}', { params: { path: { id } } }))
  return name
}
