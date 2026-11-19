import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { consumeRedirectTarget } from '../services/session'
import { makeAuthValue } from '../test/auth'
import { AuthContext, type AuthContextValue } from './authContext'
import { RequireAuth } from './RequireAuth'

function renderGuarded(auth: AuthContextValue, initialPath = '/private') {
  const router = createMemoryRouter(
    [
      { path: '/login', element: <p>login page</p> },
      {
        element: <RequireAuth />,
        children: [{ path: '/private', element: <p>secret content</p> }],
      },
    ],
    { initialEntries: [initialPath] },
  )
  render(
    <AuthContext.Provider value={auth}>
      <RouterProvider router={router} />
    </AuthContext.Provider>,
  )
  return router
}

const signedOut = () => makeAuthValue({ status: 'unauthenticated', user: null })

describe('RequireAuth', () => {
  it('shows the content to a signed-in user', () => {
    renderGuarded(makeAuthValue())

    expect(screen.getByText('secret content')).toBeInTheDocument()
  })

  it('shows the loading skeleton while the session is being checked', () => {
    renderGuarded(makeAuthValue({ status: 'loading', user: null }))

    expect(screen.getByRole('status')).toHaveTextContent('Carregando')
    expect(screen.queryByText('secret content')).not.toBeInTheDocument()
  })

  it('keeps a signed-out user on the page and asks them to sign in', () => {
    const router = renderGuarded(signedOut(), '/private?tab=budget')

    expect(screen.getByRole('heading', { name: 'Entre para continuar' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/login')
    expect(screen.queryByText('secret content')).not.toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/private')
  })

  it('goes to the login on click and remembers the requested page', async () => {
    const router = renderGuarded(signedOut(), '/private?tab=budget')

    await userEvent.click(screen.getByRole('link', { name: 'Entrar' }))

    expect(screen.getByText('login page')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
    expect(consumeRedirectTarget()).toBe('/private?tab=budget')
  })

  it('does not remember any page until the user chooses to sign in', () => {
    renderGuarded(signedOut(), '/private')

    expect(consumeRedirectTarget()).toBeNull()
  })
})
