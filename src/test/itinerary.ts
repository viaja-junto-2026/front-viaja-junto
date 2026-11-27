import type { TripActivity, TripDestination } from '../services/itinerary'

/** Parada de uma viagem para os testes. */
export function makeStop(overrides: Partial<TripDestination> = {}): TripDestination {
  return {
    id: 's1',
    tripId: 't1',
    destinationCatalogId: 'paris',
    arrival: '2027-01-15T00:00:00.000Z',
    departure: '2027-01-19T00:00:00.000Z',
    description: 'Primeira parada.',
    order: 0,
    ...overrides,
  }
}

/** Atividade de uma parada para os testes. */
export function makeTripActivity(overrides: Partial<TripActivity> = {}): TripActivity {
  return {
    id: 'a1',
    tripDestinationId: 's1',
    activityCatalogId: 'louvre',
    dateTime: '2027-01-16T10:00:00.000Z',
    durationMinutes: 180,
    expectedCost: 154,
    status: 'PENDING',
    ...overrides,
  }
}
