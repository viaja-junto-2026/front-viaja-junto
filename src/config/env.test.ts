import { afterEach, describe, expect, it, vi } from 'vitest'

describe('env', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('exposes the API URL from the environment', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api')

    const { env } = await import('./env')

    expect(env.apiUrl).toBe('http://localhost:3000/api')
  })

  it('throws when a required variable is missing', async () => {
    vi.stubEnv('VITE_API_URL', '')

    await expect(import('./env')).rejects.toThrow('VITE_API_URL')
  })
})
