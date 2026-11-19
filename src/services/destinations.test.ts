import { afterEach, describe, expect, it, vi } from 'vitest'
import { makeDestination } from '../test/destinations'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

async function loadService(fetchMock: ReturnType<typeof vi.fn>) {
  vi.stubEnv('VITE_API_URL', 'http://api.test')
  vi.stubGlobal('fetch', fetchMock)
  return import('./destinations')
}

describe('destinations service', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('lists the top destinations with the limit in the query', async () => {
    const destinations = [makeDestination(), makeDestination({ id: 'd2', name: 'Lisboa' })]
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(destinations))
    const { listTopDestinations } = await loadService(fetchMock)

    await expect(listTopDestinations({ limit: 5 })).resolves.toEqual(destinations)

    const request: Request = fetchMock.mock.calls[0][0]
    expect(request.method).toBe('GET')
    expect(request.url).toBe('http://api.test/api/destination-catalog/top?limit=5')
  })

  it('omits the limit when it is not given', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([]))
    const { listTopDestinations } = await loadService(fetchMock)

    await expect(listTopDestinations()).resolves.toEqual([])

    const request: Request = fetchMock.mock.calls[0][0]
    expect(request.url).toBe('http://api.test/api/destination-catalog/top')
  })

  it('throws an ApiError when the API fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ message: 'Invalid limit' }, 422))
    const { listTopDestinations } = await loadService(fetchMock)
    const { ApiError } = await import('./apiError')

    const error = await listTopDestinations({ limit: 99 }).catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as InstanceType<typeof ApiError>).status).toBe(422)
  })
})
