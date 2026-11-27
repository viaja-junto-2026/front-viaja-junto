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

  it.each([401, 422, 429])('throws a normalized error on HTTP %i', async (status) => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ message: 'nope' }, status))
    const { listTrips } = await loadService(fetchMock)

    await expect(listTrips()).rejects.toMatchObject({ name: 'ApiError', status })
  })
})
