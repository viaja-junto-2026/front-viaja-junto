import { afterEach, describe, expect, it, vi } from 'vitest'
import { makePaginatedTrips } from '../test/trips'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

async function loadService(fetchMock: ReturnType<typeof vi.fn>) {
  vi.stubEnv('VITE_API_URL', 'http://api.test')
  vi.stubGlobal('fetch', fetchMock)
  return import('./trips')
}

describe('trips service', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('lists the trips with page, limit and status in the query', async () => {
    const page = makePaginatedTrips()
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(page))
    const { listTrips } = await loadService(fetchMock)

    await expect(listTrips({ page: 2, limit: 9, status: 'CONFIRMED' })).resolves.toEqual(page)

    const request: Request = fetchMock.mock.calls[0][0]
    expect(request.method).toBe('GET')
    expect(request.url).toBe('http://api.test/api/trips?page=2&limit=9&status=CONFIRMED')
  })

  it('returns an empty list when the API sends no data', async () => {
    const { meta } = makePaginatedTrips([])
    const { listTrips } = await loadService(vi.fn().mockResolvedValue(jsonResponse({ meta })))

    await expect(listTrips()).resolves.toEqual({ data: [], meta })
  })

  const input = {
    name: 'Floripa',
    description: '',
    startDate: null,
    endDate: null,
    status: 'PLANNING' as const,
    currency: 'BRL',
  }

  it('creates a trip leaving the empty fields out', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ id: 'new' }, 201))
    const { createTrip } = await loadService(fetchMock)

    await expect(createTrip(input)).resolves.toEqual({ id: 'new' })

    const request: Request = fetchMock.mock.calls[0][0]
    expect(request.method).toBe('POST')
    expect(request.url).toBe('http://api.test/api/trips')
    await expect(request.json()).resolves.toEqual({
      name: 'Floripa',
      status: 'PLANNING',
      currency: 'BRL',
    })
  })

  it('sends the filled optional fields on create', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ id: 'new' }, 201))
    const { createTrip } = await loadService(fetchMock)
    const full = { ...input, description: 'Praia', startDate: '2027-01-01', endDate: '2027-01-02' }

    await createTrip(full)

    await expect((fetchMock.mock.calls[0][0] as Request).json()).resolves.toEqual(full)
  })

  it('gets one trip by id', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ id: 'abc' }))
    const { getTrip } = await loadService(fetchMock)

    await expect(getTrip('abc')).resolves.toEqual({ id: 'abc' })
    expect((fetchMock.mock.calls[0][0] as Request).url).toBe('http://api.test/api/trips/abc')
  })

  it('updates a trip, sending null to clear a date', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ id: 'abc' }))
    const { updateTrip } = await loadService(fetchMock)

    await updateTrip('abc', input)

    const request: Request = fetchMock.mock.calls[0][0]
    expect(request.method).toBe('PATCH')
    await expect(request.json()).resolves.toEqual(input)
  })

  it('deletes a trip', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    const { deleteTrip } = await loadService(fetchMock)

    await expect(deleteTrip('abc')).resolves.toBeUndefined()

    const request: Request = fetchMock.mock.calls[0][0]
    expect(request.method).toBe('DELETE')
    expect(request.url).toBe('http://api.test/api/trips/abc')
  })

  it.each([403, 404])('throws a normalized error on delete with HTTP %i', async (status) => {
    const { deleteTrip } = await loadService(vi.fn().mockResolvedValue(jsonResponse({}, status)))

    await expect(deleteTrip('abc')).rejects.toMatchObject({ name: 'ApiError', status })
  })

  it.each([401, 422, 429])('throws a normalized error on HTTP %i', async (status) => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ message: 'nope' }, status))
    const { listTrips } = await loadService(fetchMock)

    await expect(listTrips()).rejects.toMatchObject({ name: 'ApiError', status })
  })
})
