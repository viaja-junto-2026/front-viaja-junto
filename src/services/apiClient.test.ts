import { afterEach, describe, expect, it, vi } from 'vitest'

function okResponse() {
  return new Response(JSON.stringify({ status: 'ok' }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}

describe('apiClient', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('sends requests to the URL defined in the environment', async () => {
    vi.stubEnv('VITE_API_URL', 'http://api.test')
    const fetchMock = vi.fn().mockResolvedValue(okResponse())
    vi.stubGlobal('fetch', fetchMock)

    const { apiClient } = await import('./apiClient')
    await apiClient.GET('/api/health')

    const request: Request = fetchMock.mock.calls[0][0]
    expect(request.url).toBe('http://api.test/api/health')
    expect(request.method).toBe('GET')
  })

  it('sends the session token in the Authorization header', async () => {
    vi.stubEnv('VITE_API_URL', 'http://api.test')
    const fetchMock = vi.fn().mockResolvedValue(okResponse())
    vi.stubGlobal('fetch', fetchMock)

    const { saveToken } = await import('./session')
    const { apiClient } = await import('./apiClient')
    saveToken('my-token', 3600)
    await apiClient.GET('/api/health')

    const request: Request = fetchMock.mock.calls[0][0]
    expect(request.headers.get('Authorization')).toBe('Bearer my-token')
  })

  it('does not send the Authorization header without a session', async () => {
    vi.stubEnv('VITE_API_URL', 'http://api.test')
    const fetchMock = vi.fn().mockResolvedValue(okResponse())
    vi.stubGlobal('fetch', fetchMock)

    const { apiClient } = await import('./apiClient')
    await apiClient.GET('/api/health')

    const request: Request = fetchMock.mock.calls[0][0]
    expect(request.headers.has('Authorization')).toBe(false)
  })

  it('ends the session and warns the app when the API answers 401', async () => {
    vi.stubEnv('VITE_API_URL', 'http://api.test')
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 401 }))
    vi.stubGlobal('fetch', fetchMock)

    const { getToken, saveToken, setUnauthorizedHandler } = await import('./session')
    const { apiClient } = await import('./apiClient')
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    saveToken('expired-token', 3600)
    await apiClient.GET('/api/auth/me')

    expect(handler).toHaveBeenCalledOnce()
    expect(getToken()).toBeNull()
  })

  it('does not end the session on other errors', async () => {
    vi.stubEnv('VITE_API_URL', 'http://api.test')
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 500 }))
    vi.stubGlobal('fetch', fetchMock)

    const { getToken, saveToken, setUnauthorizedHandler } = await import('./session')
    const { apiClient } = await import('./apiClient')
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    saveToken('my-token', 3600)
    await apiClient.GET('/api/auth/me')

    expect(handler).not.toHaveBeenCalled()
    expect(getToken()).toBe('my-token')
  })
})
