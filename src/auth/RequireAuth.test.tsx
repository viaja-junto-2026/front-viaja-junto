import { render, screen, waitFor } from '@testing-library/react'
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

describe('RequireAuth', () => {
  it('shows the content to a signed-in user', () => {
    renderGuarded(makeAuthValue())

    expect(screen.getByText('secret content')).toBeInTheDocument()
  })

  it('shows a loading message while the session is being checked', () => {
    renderGuarded(makeAuthValue({ status: 'loading', user: null }))

    expect(screen.getByRole('status')).toHaveTextContent('Carregando...')
    expect(screen.queryByText('secret content')).not.toBeInTheDocument()
  })

  it('sends a signed-out user to the login and remembers the requested page', async () => {
    const router = renderGuarded(
      makeAuthValue({ status: 'unauthenticated', user: null }),
      '/private?tab=budget',
    )

    await waitFor(() => expect(screen.getByText('login page')).toBeInTheDocument())
    expect(router.state.location.pathname).toBe('/login')
    expect(screen.queryByText('secret content')).not.toBeInTheDocument()
    expect(consumeRedirectTarget()).toBe('/private?tab=budget')
  })
})
