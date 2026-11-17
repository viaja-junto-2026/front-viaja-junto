import { afterEach, describe, expect, it, vi } from 'vitest'

describe('apiClient', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('sends requests to the URL defined in the environment', async () => {
    vi.stubEnv('VITE_API_URL', 'http://api.test')
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const { apiClient } = await import('./apiClient')
    await apiClient.GET('/api/health')

    const request: Request = fetchMock.mock.calls[0][0]
    expect(request.url).toBe('http://api.test/api/health')
    expect(request.method).toBe('GET')
  })
})
