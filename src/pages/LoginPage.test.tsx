import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, type InitialEntry } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthContext, type AuthContextValue } from '../auth/authContext'
import { makeAuthValue } from '../test/auth'
import LoginPage from './LoginPage'

vi.mock('../services/auth', () => ({
  getGoogleLoginUrl: () => 'http://api.test/api/auth/google',
}))

function renderLogin(
  auth: AuthContextValue = makeAuthValue({ status: 'unauthenticated', user: null }),
  initialEntry: InitialEntry = '/login',
) {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/trips" element={<h1>Minhas viagens</h1>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('LoginPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('navigates to the Google login URL and shows a loading state on click', async () => {
    const assign = vi.fn()
    vi.stubGlobal('location', { ...window.location, assign })

    renderLogin()

    expect(screen.getByRole('heading', { level: 1, name: 'Entrar' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'ViajaJunto' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar para o início' })).toHaveAttribute('href', '/')

    const button = screen.getByRole('button', { name: 'Entrar com o Google' })
    await userEvent.click(button)

    expect(assign).toHaveBeenCalledWith('http://api.test/api/auth/google')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
  })

  it('redirects an already authenticated user directly to /trips', () => {
    renderLogin(makeAuthValue())

    expect(screen.getByRole('heading', { level: 1, name: 'Minhas viagens' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Entrar com o Google' })).not.toBeInTheDocument()
  })

  it('shows an error alert when the callback forwards an error via query string or router state', () => {
    const visitor = makeAuthValue({ status: 'unauthenticated', user: null })
    const { unmount } = renderLogin(visitor, '/login?error=access_denied')

    expect(screen.getByRole('alert')).toHaveTextContent('O login com o Google foi cancelado')

    unmount()
    renderLogin(visitor, {
      pathname: '/login',
      state: { error: 'Falha ao validar sua conta Google.' },
    })

    expect(screen.getByRole('alert')).toHaveTextContent('Falha ao validar sua conta Google.')
  })

  it('shows a loading skeleton while the session is being checked', () => {
    renderLogin(makeAuthValue({ status: 'loading', user: null }))

    expect(screen.getByRole('status')).toHaveTextContent('Verificando sessão')
  })
})
