import { afterEach, describe, expect, it, vi } from 'vitest'
import { makeActivityReview, makePaginatedReviews } from '../test/reviews'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

async function loadService(fetchMock: ReturnType<typeof vi.fn>) {
  vi.stubEnv('VITE_API_URL', 'http://api.test')
  vi.stubGlobal('fetch', fetchMock)
  return import('./reviews')
}

describe('reviews service', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('lists paginated reviews with activityId, page and limit in the query', async () => {
    const paginated = makePaginatedReviews([makeActivityReview()], {
      page: 2,
      limit: 5,
      total: 8,
      totalPages: 2,
      hasPrevious: true,
      hasNext: false,
    })
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(paginated))
    const { listReviews } = await loadService(fetchMock)

    await expect(listReviews({ activityId: 'a1', page: 2, limit: 5 })).resolves.toEqual(paginated)

    const request: Request = fetchMock.mock.calls[0][0]
    expect(request.method).toBe('GET')
    expect(request.url).toBe('http://api.test/api/reviews?activityId=a1&page=2&limit=5')
  })

  it('normalizes an omitted data array to an empty array', async () => {
    const meta = makePaginatedReviews([]).meta
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ meta }))
    const { listReviews } = await loadService(fetchMock)

    await expect(listReviews()).resolves.toEqual({ data: [], meta })

    const request: Request = fetchMock.mock.calls[0][0]
    expect(request.url).toBe('http://api.test/api/reviews')
  })

  it('throws an ApiError when the API fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ message: 'Invalid page' }, 422))
    const { listReviews } = await loadService(fetchMock)
    const { ApiError } = await import('./apiError')

    const error = await listReviews({ page: 0 }).catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as InstanceType<typeof ApiError>).status).toBe(422)
  })
})
