import { afterEach, describe, expect, it, vi } from 'vitest'
import { testUser } from '../test/auth'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

async function loadAuthService(fetchMock: ReturnType<typeof vi.fn>) {
  vi.stubEnv('VITE_API_URL', 'http://api.test')
  vi.stubGlobal('fetch', fetchMock)
  return import('./auth')
}

describe('auth service', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('builds the Google sign-in address from the API URL', async () => {
    const { getGoogleLoginUrl } = await loadAuthService(vi.fn())

    expect(getGoogleLoginUrl()).toBe('http://api.test/api/auth/google')
  })

  it('loads the current user', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(testUser))
    const { getCurrentUser } = await loadAuthService(fetchMock)

    await expect(getCurrentUser()).resolves.toEqual(testUser)

    const request: Request = fetchMock.mock.calls[0][0]
    expect(request.url).toBe('http://api.test/api/auth/me')
  })

  it('fails when the API does not return the user', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ message: 'nope' }, 404))
    const { getCurrentUser } = await loadAuthService(fetchMock)

    await expect(getCurrentUser()).rejects.toThrow('HTTP 404')
  })

  it('signs out in the back-end', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    const { logout } = await loadAuthService(fetchMock)

    await expect(logout()).resolves.toBeUndefined()

    const request: Request = fetchMock.mock.calls[0][0]
    expect(request.method).toBe('POST')
    expect(request.url).toBe('http://api.test/api/auth/logout')
  })

  it('fails when the back-end refuses to sign out', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ message: 'nope' }, 500))
    const { logout } = await loadAuthService(fetchMock)

    await expect(logout()).rejects.toThrow('HTTP 500')
  })
})
