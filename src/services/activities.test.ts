import { afterEach, describe, expect, it, vi } from 'vitest'
import { makeActivityDetails } from '../test/activities'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

async function loadService(fetchMock: ReturnType<typeof vi.fn>) {
  vi.stubEnv('VITE_API_URL', 'http://api.test')
  vi.stubGlobal('fetch', fetchMock)
  return import('./activities')
}

describe('activities service', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('fetches activity details by id', async () => {
    const details = makeActivityDetails({ id: 'louvre-id' })
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(details))
    const { getActivityDetails } = await loadService(fetchMock)

    await expect(getActivityDetails('louvre-id')).resolves.toEqual(details)

    const request: Request = fetchMock.mock.calls[0][0]
    expect(request.method).toBe('GET')
    expect(request.url).toBe('http://api.test/api/activity-catalog/louvre-id/details')
  })

  it('throws an ApiError when the activity is not found', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ message: 'Not found' }, 404))
    const { getActivityDetails } = await loadService(fetchMock)
    const { ApiError } = await import('./apiError')

    const error = await getActivityDetails('missing').catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as InstanceType<typeof ApiError>).status).toBe(404)
  })
})
