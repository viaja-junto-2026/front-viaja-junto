import { useAuth } from '../auth/useAuth'
import { listTrips } from '../services/trips'
import type { TripStatus } from '../utils/labels'
import { usePaginatedQuery } from './usePaginatedQuery'

/** Chave base de cache das viagens (use em `invalidateKeys` ao criar, editar ou excluir). */
export const tripsKey = ['trips'] as const

type TripFilters = { status?: TripStatus }

type UseTripsOptions = {
  /** Quantas viagens por página (padrão 6: duas linhas no desktop, seis no deslize do celular). */
  limit?: number
}

/** Viagens do usuário logado, com filtro por status e paginação. */
export function useTrips({ limit = 6 }: UseTripsOptions = {}) {
  const { user } = useAuth()

  const trips = usePaginatedQuery({
    // O id do usuário separa o cache: ao trocar de conta, a lista da outra não aparece.
    queryKey: [...tripsKey, user?.id],
    queryFn: ({ page, limit: pageSize, status }: { page: number; limit: number } & TripFilters) =>
      listTrips({ page, limit: pageSize, status }),
    initialFilters: { status: undefined } as TripFilters,
    initialLimit: limit,
  })

  return {
    ...trips,
    status: trips.filters.status,
    /** Filtra por status (sem valor, mostra todas) e volta para a primeira página. */
    setStatus: (status?: TripStatus) => trips.setFilters({ status }),
  }
}
