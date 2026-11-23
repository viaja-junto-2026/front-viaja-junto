import { render, screen, waitFor } from '@testing-library/react'
import { StrictMode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext, type AuthContextValue } from '../auth/authContext'
import { ApiError } from '../services/apiError'
import { saveRedirectTarget } from '../services/session'
import { makeAuthValue } from '../test/auth'
import AuthCallbackPage from './AuthCallbackPage'

function renderCallback(initialEntry: string, auth: AuthContextValue) {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/trips" element={<h1>Minhas viagens</h1>} />
          <Route path="/trips/eurotrip" element={<h1>Eurotrip 2027</h1>} />
          <Route path="/login" element={<h1>Entrar</h1>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('AuthCallbackPage', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    window.history.replaceState(null, '', '/')
  })

  it('shows the loading state while confirming the session', () => {
    const auth = makeAuthValue({
      status: 'unauthenticated',
      user: null,
      signIn: vi.fn().mockReturnValue(new Promise(() => {})),
    })

    renderCallback('/auth/callback#access_token=jwt-token&token_type=Bearer&expires_in=3600', auth)

    expect(screen.getByRole('heading', { level: 1, name: 'Entrando...' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Confirmando sua sessão')
  })

  it('clears the URL fragment, signs in, and redirects to /trips', async () => {
    window.history.replaceState(
      null,
      '',
      '/auth/callback#access_token=jwt-token&token_type=Bearer&expires_in=3600',
    )
    const replaceSpy = vi.spyOn(window.history, 'replaceState')
    const auth = makeAuthValue({
      status: 'unauthenticated',
      user: null,
      signIn: vi.fn().mockResolvedValue(undefined),
    })

    renderCallback('/auth/callback#access_token=jwt-token&token_type=Bearer&expires_in=3600', auth)

    expect(replaceSpy).toHaveBeenCalledWith(null, '', '/auth/callback')
    expect(window.location.hash).toBe('')
    expect(auth.signIn).toHaveBeenCalledWith('jwt-token', 3600)
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Minhas viagens' }),
    ).toBeInTheDocument()
  })

  it('redirects to the saved redirect target when one exists', async () => {
    saveRedirectTarget('/trips/eurotrip')
    const auth = makeAuthValue({
      status: 'unauthenticated',
      user: null,
      signIn: vi.fn().mockResolvedValue(undefined),
    })

    renderCallback('/auth/callback#access_token=jwt-token', auth)

    expect(auth.signIn).toHaveBeenCalledWith('jwt-token', undefined)
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Eurotrip 2027' }),
    ).toBeInTheDocument()
  })

  it('shows an error when the hash has no access_token or has an unsupported token_type', () => {
    const auth = makeAuthValue({
      status: 'unauthenticated',
      user: null,
      signIn: vi.fn(),
    })

    const { unmount } = renderCallback('/auth/callback', auth)
    expect(auth.signIn).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Não recebemos o token de acesso')
    expect(screen.getByRole('link', { name: 'Voltar para o login' })).toHaveAttribute(
      'href',
      '/login',
    )

    unmount()
    renderCallback('/auth/callback#access_token=jwt-token&token_type=Basic', auth)
    expect(auth.signIn).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Não recebemos o token de acesso')
  })

  it('completes sign-in and redirects even under React StrictMode', async () => {
    const auth = makeAuthValue({
      status: 'unauthenticated',
      user: null,
      signIn: vi.fn().mockResolvedValue(undefined),
    })

    render(
      <StrictMode>
        <AuthContext.Provider value={auth}>
          <MemoryRouter initialEntries={['/auth/callback#access_token=jwt-token&expires_in=3600']}>
            <Routes>
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/trips" element={<h1>Minhas viagens</h1>} />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      </StrictMode>,
    )

    expect(auth.signIn).toHaveBeenCalledOnce()
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Minhas viagens' }),
    ).toBeInTheDocument()
  })

  it('shows an error when /auth/me (signIn) fails', async () => {
    const auth = makeAuthValue({
      status: 'unauthenticated',
      user: null,
      signIn: vi.fn().mockRejectedValue(ApiError.fromResponse(401)),
    })

    renderCallback('/auth/callback#access_token=bad-token', auth)

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Sua sessão expirou. Entre de novo para continuar.',
      ),
    )
    expect(screen.getByRole('link', { name: 'Voltar para o login' })).toHaveAttribute(
      'href',
      '/login',
    )
  })
})
