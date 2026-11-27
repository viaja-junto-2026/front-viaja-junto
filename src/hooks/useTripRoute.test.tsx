import { QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../auth/authContext'
import { getActivity } from '../services/activities'
import { getDestination } from '../services/destinations'
import { listTripActivities, listTripDestinations } from '../services/itinerary'
import { makeActivity } from '../test/activities'
import { makeAuthValue } from '../test/auth'
import { makeDestination } from '../test/destinations'
import { makeStop, makeTripActivity } from '../test/itinerary'
import { createTestQueryClient } from '../test/query'
import { useTripRoute } from './useTripRoute'

vi.mock('../services/itinerary', () => ({
  listTripDestinations: vi.fn(),
  listTripActivities: vi.fn(),
}))
vi.mock('../services/destinations', () => ({ getDestination: vi.fn() }))
vi.mock('../services/activities', () => ({ getActivity: vi.fn() }))

function renderRoute() {
  const client = createTestQueryClient()
  return renderHook(() => useTripRoute('t1'), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>
        <AuthContext.Provider value={makeAuthValue()}>{children}</AuthContext.Provider>
      </QueryClientProvider>
    ),
  })
}

describe('useTripRoute', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('orders the stops and asks the catalog only once per item', async () => {
    vi.mocked(listTripDestinations).mockResolvedValue([
      makeStop({ id: 's2', order: 1 }),
      makeStop({ id: 's1', order: 0 }),
    ])
    vi.mocked(listTripActivities).mockImplementation(async (stopId) => [
      makeTripActivity({ id: `${stopId}-a`, tripDestinationId: stopId }),
    ])
    vi.mocked(getDestination).mockResolvedValue(makeDestination({ name: 'Paris' }))
    vi.mocked(getActivity).mockResolvedValue(makeActivity({ name: 'Louvre' }))

    const { result } = renderRoute()

    await waitFor(() => expect(result.current.stops[0]?.activities[0]?.catalog).toBeDefined())
    expect(result.current.stops.map((stop) => stop.id)).toEqual(['s1', 's2'])
    expect(result.current.stops[1].activities[0].catalog?.name).toBe('Louvre')
    expect(result.current.activityCount).toBe(2)
    // as duas paradas apontam para o mesmo destino e a mesma atividade do catálogo
    expect(getDestination).toHaveBeenCalledTimes(1)
    expect(getActivity).toHaveBeenCalledTimes(1)
  })

  it('keeps the route when the catalog fails', async () => {
    vi.mocked(listTripDestinations).mockResolvedValue([makeStop()])
    vi.mocked(listTripActivities).mockResolvedValue([])
    vi.mocked(getDestination).mockRejectedValue(new Error('falhou'))

    const { result } = renderRoute()

    await waitFor(() => expect(result.current.stops).toHaveLength(1))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isError).toBe(false)
    expect(result.current.stops[0].catalog).toBeUndefined()
  })

  it('is empty without stops and exposes errors', async () => {
    vi.mocked(listTripDestinations).mockResolvedValue([])
    const empty = renderRoute()
    await waitFor(() => expect(empty.result.current.isEmpty).toBe(true))

    vi.mocked(listTripDestinations).mockRejectedValue(new Error('falhou'))
    const failed = renderRoute()
    await waitFor(() => expect(failed.result.current.isError).toBe(true))
    expect(failed.result.current.isEmpty).toBe(false)
  })
})
