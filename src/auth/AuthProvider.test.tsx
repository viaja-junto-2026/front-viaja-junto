import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getCurrentUser, logout } from '../services/auth'
import { getToken, notifyUnauthorized, saveToken } from '../services/session'
import { testUser } from '../test/auth'
import { AuthProvider } from './AuthProvider'
import { useAuth } from './useAuth'

vi.mock('../services/auth', () => ({
  getCurrentUser: vi.fn(),
  logout: vi.fn(),
}))

function Probe() {
  const { status, user, sessionExpired, sessionError, retrySession, signIn, signOut } = useAuth()
  return (
    <div>
      <p data-testid="status">{status}</p>
      <p data-testid="user">{user?.name ?? 'nobody'}</p>
      <p data-testid="expired">{sessionExpired ? 'expired' : 'no'}</p>
      <p data-testid="error">{sessionError ? 'error' : 'no'}</p>
      <button onClick={retrySession}>retry</button>
      <button onClick={() => signIn('new-token', 3600).catch(() => {})}>sign in</button>
      <button onClick={() => signOut()}>sign out</button>
    </div>
  )
}

function renderProvider() {
  return render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.mocked(getCurrentUser).mockReset()
    vi.mocked(logout).mockReset()
  })

  it('starts signed out when there is no stored token', () => {
    renderProvider()

    expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated')
    expect(getCurrentUser).not.toHaveBeenCalled()
  })

  it('confirms the user in the API when there is a stored token', async () => {
    saveToken('stored-token', 3600)
    vi.mocked(getCurrentUser).mockResolvedValue(testUser)

    renderProvider()

    expect(screen.getByTestId('status')).toHaveTextContent('loading')
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'))
    expect(screen.getByTestId('user')).toHaveTextContent('Gustavo Fidelis')
  })

  it('signs out when the stored token is not accepted', async () => {
    saveToken('stored-token', 3600)
    vi.mocked(getCurrentUser).mockRejectedValue(new Error('401'))

    renderProvider()

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'))
  })

  it('opens the session on sign in', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(testUser)
    renderProvider()

    await userEvent.click(screen.getByText('sign in'))

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'))
    expect(getToken()).toBe('new-token')
  })

  it('discards the token when the user cannot be confirmed on sign in', async () => {
    vi.mocked(getCurrentUser).mockRejectedValue(new Error('401'))
    renderProvider()

    await userEvent.click(screen.getByText('sign in'))

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'))
    expect(getToken()).toBeNull()
  })

  it('calls the API and clears the session on sign out', async () => {
    saveToken('stored-token', 3600)
    vi.mocked(getCurrentUser).mockResolvedValue(testUser)
    vi.mocked(logout).mockResolvedValue(undefined)
    renderProvider()
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'))

    await userEvent.click(screen.getByText('sign out'))

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'))
    expect(logout).toHaveBeenCalledOnce()
    expect(getToken()).toBeNull()
  })

  it('clears the session on sign out even when the API fails', async () => {
    saveToken('stored-token', 3600)
    vi.mocked(getCurrentUser).mockResolvedValue(testUser)
    vi.mocked(logout).mockRejectedValue(new Error('network'))
    renderProvider()
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'))

    await userEvent.click(screen.getByText('sign out'))

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'))
    expect(getToken()).toBeNull()
  })

  it('signs out when the API refuses the token (401)', async () => {
    saveToken('stored-token', 3600)
    vi.mocked(getCurrentUser).mockResolvedValue(testUser)
    renderProvider()
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'))

    notifyUnauthorized()

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'))
    expect(screen.getByTestId('expired')).toHaveTextContent('expired')
    expect(getToken()).toBeNull()
  })

  it('keeps the expired flag when the stored token is refused at startup', async () => {
    saveToken('stored-token', 3600)
    vi.mocked(getCurrentUser).mockImplementation(async () => {
      await Promise.resolve()
      notifyUnauthorized()
      throw new Error('401')
    })

    renderProvider()

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'))
    expect(screen.getByTestId('expired')).toHaveTextContent('expired')
  })

  it('does not treat a sign out as an expired session', async () => {
    saveToken('stored-token', 3600)
    vi.mocked(getCurrentUser).mockResolvedValue(testUser)
    vi.mocked(logout).mockImplementation(async () => notifyUnauthorized())
    renderProvider()
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'))

    await userEvent.click(screen.getByText('sign out'))

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'))
    expect(screen.getByTestId('expired')).toHaveTextContent('no')
  })

  it('keeps the token and allows a retry when the API is unreachable', async () => {
    saveToken('stored-token', 3600)
    vi.mocked(getCurrentUser).mockRejectedValueOnce(new TypeError('Failed to fetch'))
    renderProvider()
    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('error'))
    expect(getToken()).toBe('stored-token')

    vi.mocked(getCurrentUser).mockResolvedValue(testUser)
    await userEvent.click(screen.getByText('retry'))

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'))
    expect(screen.getByTestId('error')).toHaveTextContent('no')
  })

  it('requires the provider to use the hook', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<Probe />)).toThrow('useAuth must be used inside an AuthProvider')
  })
})
