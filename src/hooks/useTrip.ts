import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../auth/useAuth'
import { getTrip } from '../services/trips'

/**
 * Chave de cache de uma viagem. Fica fora de `tripsKey` para a exclusão atualizar as listas
 * sem buscar de novo a viagem que acabou de ser apagada.
 */
export function tripKey(userId: string | undefined, id: string) {
  return ['trip', userId, id] as const
}

/** Busca uma viagem do usuário logado pelo `id`. */
export function useTrip(id: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: tripKey(user?.id, id),
    queryFn: () => getTrip(id),
    enabled: Boolean(id),
  })
}
