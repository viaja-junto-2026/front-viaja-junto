import { afterEach, describe, expect, it, vi } from 'vitest'
import { makeStop, makeTripActivity } from '../test/itinerary'
import { makePaginationMeta } from '../test/reviews'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

async function load(fetchMock: ReturnType<typeof vi.fn>) {
  vi.stubEnv('VITE_API_URL', 'http://api.test')
  vi.stubGlobal('fetch', fetchMock)
  return {
    ...(await import('./itinerary')),
    ...(await import('./destinations')),
    ...(await import('./activities')),
  }
}

const url = (fetchMock: ReturnType<typeof vi.fn>, call = 0) =>
  (fetchMock.mock.calls[call][0] as Request).url

describe('itinerary services', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('joins every page of the trip destinations', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ data: [makeStop()], meta: makePaginationMeta({ hasNext: true }) }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ data: [makeStop({ id: 's2' })], meta: makePaginationMeta() }),
      )
    const { listTripDestinations } = await load(fetchMock)

    const stops = await listTripDestinations('t1')

    expect(stops.map((stop) => stop.id)).toEqual(['s1', 's2'])
    expect(url(fetchMock)).toBe('http://api.test/api/trip-destinations?tripId=t1&page=1&limit=100')
    expect(url(fetchMock, 1)).toContain('page=2')
  })

  it('lists the activities of a stop', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ data: [makeTripActivity()], meta: makePaginationMeta() }))
    const { listTripActivities } = await load(fetchMock)

    await expect(listTripActivities('s1')).resolves.toHaveLength(1)
    expect(url(fetchMock)).toBe(
      'http://api.test/api/trip-activities?tripDestinationId=s1&page=1&limit=100',
    )
  })

  it('accepts a page without data', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(async () => jsonResponse({ meta: makePaginationMeta() }))
    const { listTripActivities, listTripDestinations } = await load(fetchMock)

    await expect(listTripActivities('s1')).resolves.toEqual([])
    await expect(listTripDestinations('t1')).resolves.toEqual([])
  })

  it('throws a normalized error without access', async () => {
    const { listTripDestinations } = await load(vi.fn().mockResolvedValue(jsonResponse({}, 403)))

    await expect(listTripDestinations('t1')).rejects.toMatchObject({
      name: 'ApiError',
      status: 403,
    })
  })

  it('gets one catalog destination and one catalog activity', async () => {
    const fetchMock = vi.fn().mockImplementation(async () => jsonResponse({ id: 'x' }))
    const { getDestination, getActivity } = await load(fetchMock)

    await getDestination('paris')
    await getActivity('louvre')

    expect(url(fetchMock)).toBe('http://api.test/api/destination-catalog/paris')
    expect(url(fetchMock, 1)).toBe('http://api.test/api/activity-catalog/louvre')
  })

  const stop = { arrival: '2027-01-15', departure: null, description: '' }
  const planned = {
    dateTime: null,
    durationMinutes: 90,
    expectedCost: null,
    status: 'PENDING' as const,
  }
  const okMock = () => vi.fn().mockImplementation(async () => jsonResponse({ id: 'x' }))
  const sent = async (fetchMock: ReturnType<typeof vi.fn>) => {
    const request = fetchMock.mock.calls[0][0] as Request
    return [request.method, request.url, await request.json()]
  }

  it('creates a stop and an activity leaving the empty fields out', async () => {
    const stopMock = okMock()
    const { createTripDestination } = await load(stopMock)
    await createTripDestination({ ...stop, tripId: 't1', destinationCatalogId: 'c1', order: 0 })
    await expect(sent(stopMock)).resolves.toEqual([
      'POST',
      'http://api.test/api/trip-destinations',
      { arrival: '2027-01-15', tripId: 't1', destinationCatalogId: 'c1', order: 0 },
    ])

    vi.resetModules()
    const activityMock = okMock()
    const { createTripActivity } = await load(activityMock)
    await createTripActivity({ ...planned, tripDestinationId: 's1', activityCatalogId: 'a1' })
    await expect(sent(activityMock)).resolves.toEqual([
      'POST',
      'http://api.test/api/trip-activities',
      { durationMinutes: 90, status: 'PENDING', tripDestinationId: 's1', activityCatalogId: 'a1' },
    ])
  })

  it('updates sending null to clear fields', async () => {
    const stopMock = okMock()
    const { updateTripDestination } = await load(stopMock)
    await updateTripDestination('s1', stop)
    await expect(sent(stopMock)).resolves.toEqual([
      'PATCH',
      'http://api.test/api/trip-destinations/s1',
      stop,
    ])

    vi.resetModules()
    const activityMock = okMock()
    const { updateTripActivity } = await load(activityMock)
    await updateTripActivity('a1', planned)
    await expect(sent(activityMock)).resolves.toEqual([
      'PATCH',
      'http://api.test/api/trip-activities/a1',
      planned,
    ])
  })

  it('reorders with every destination id', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([]))
    const { reorderTripDestinations } = await load(fetchMock)

    await reorderTripDestinations('t1', ['s2', 's1'])

    await expect(sent(fetchMock)).resolves.toEqual([
      'PUT',
      'http://api.test/api/trips/t1/destinations/order',
      { destinationIds: ['s2', 's1'] },
    ])
  })

  it('deletes a stop and an activity', async () => {
    const fetchMock = vi.fn().mockImplementation(async () => new Response(null, { status: 204 }))
    const { deleteTripDestination, deleteTripActivity } = await load(fetchMock)

    await deleteTripDestination('s1')
    await deleteTripActivity('a1')

    expect(url(fetchMock)).toBe('http://api.test/api/trip-destinations/s1')
    expect(url(fetchMock, 1)).toBe('http://api.test/api/trip-activities/a1')
  })
})
