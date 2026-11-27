import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../auth/useAuth'
import { listTrips } from '../services/trips'
import type { TripStatus } from '../utils/labels'
import { tripsKey } from './useTrips'

export type TripCounts = Record<TripStatus, number> & { total: number }

/** A API não tem um resumo: o total de cada status vem dos metadados de uma página mínima. */
async function countByStatus(status: TripStatus): Promise<number> {
  const { meta } = await listTrips({ page: 1, limit: 1, status })
  return meta.total
}

async function countTrips(): Promise<TripCounts> {
  const [PLANNING, CONFIRMED, COMPLETED] = await Promise.all([
    countByStatus('PLANNING'),
    countByStatus('CONFIRMED'),
    countByStatus('COMPLETED'),
  ])

  return { PLANNING, CONFIRMED, COMPLETED, total: PLANNING + CONFIRMED + COMPLETED }
}

/** Quantidade de viagens do usuário em cada status. Fica sob `tripsKey` para ser refeita junto. */
export function useTripCounts() {
  const { user } = useAuth()

  return useQuery({ queryKey: [...tripsKey, user?.id, 'counts'], queryFn: countTrips })
}
