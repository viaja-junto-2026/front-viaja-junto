import type { Trip } from '../services/trips'
import type { Paginated, PaginationMeta } from '../types/pagination'
import { makePaginationMeta } from './reviews'

/** Viagem para os testes: planejada pelo próprio usuário, com datas. */
export function makeTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: 't1',
    name: 'Eurotrip 2027',
    description: 'Duas semanas pela Europa.',
    startDate: '2027-07-01',
    endDate: '2027-07-15',
    status: 'PLANNING',
    createdBy: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
    currency: 'BRL',
    role: 'OWNER',
    createdAt: '2026-03-14T18:22:05.000Z',
    ...overrides,
  }
}

/** Resposta paginada de viagens para os testes. */
export function makePaginatedTrips(
  data: Trip[] = [makeTrip()],
  metaOverrides: Partial<PaginationMeta> = {},
): Paginated<Trip> {
  return {
    data,
    meta: makePaginationMeta({ limit: 9, total: data.length, ...metaOverrides }),
  }
}
