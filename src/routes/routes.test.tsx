import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router'
import { AuthContext, type AuthContextValue } from '../auth/authContext'
import { AppLayout } from '../layouts/AppLayout'
import ErrorPage from '../pages/ErrorPage'
import { makeAuthValue } from '../test/auth'
import { createTestQueryClient } from '../test/query'
import { routes } from './routes'

// A home busca os destinos mais bem avaliados: nos testes de rota a lista vem vazia.
vi.mock('../services/destinations', () => ({
  listDestinations: vi.fn().mockResolvedValue({
    data: [],
    meta: { page: 1, limit: 12, total: 0, totalPages: 0, hasNext: false, hasPrevious: false },
  }),
  listTopDestinations: vi.fn().mockResolvedValue([]),
  getDestinationDetails: vi.fn().mockResolvedValue({
    id: '1',
    name: 'Paris',
    country: 'França',
    countryCode: 'FR',
    category: 'CITY',
    description: null,
    latitude: null,
    longitude: null,
    photoUrl: null,
    averageRating: null,
    reviewCount: 0,
    latestReviews: [],
  }),
}))
vi.mock('../services/activities', () => ({
  getActivityDetails: vi.fn().mockResolvedValue({
    id: '1',
    name: 'Museu do Louvre',
    description: null,
    type: 'TOUR',
    location: null,
    city: 'Paris',
    country: 'França',
    latitude: null,
    longitude: null,
    googlePlaceId: null,
    photoUrl: null,
    mapsUrl: null,
    source: null,
    averageRating: null,
    reviewCount: 0,
    createdAt: '2026-02-01T12:00:00.000Z',
    destinationId: null,
    latestReviews: [],
  }),
  listActivities: vi.fn().mockResolvedValue({
    data: [],
    meta: { page: 1, limit: 9, total: 0, totalPages: 0, hasNext: false, hasPrevious: false },
  }),
}))
vi.mock('../services/trips', () => ({
  listTrips: vi.fn().mockResolvedValue({
    data: [],
    meta: { page: 1, limit: 9, total: 0, totalPages: 0, hasNext: false, hasPrevious: false },
  }),
}))
vi.mock('../services/reviews', () => ({
  listReviews: vi.fn().mockResolvedValue({
    data: [],
    meta: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrevious: false },
  }),
}))

/** Renderiza o app em um caminho, por padrão com um usuário logado. */
function renderAt(
  path: string,
  routeObjects: RouteObject[] = routes,
  auth: AuthContextValue = makeAuthValue(),
) {
  const router = createMemoryRouter(routeObjects, { initialEntries: [path] })
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <AuthContext.Provider value={auth}>
        <RouterProvider router={router} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
  return router
}

describe('routes', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it.each([
    ['/', 'Sua viagem começa aqui.'],
    ['/auth/callback', 'Entrando...'],
    ['/destinations', 'Destinos'],
    ['/destinations/1', 'Paris'],
    ['/activities/1', 'Museu do Louvre'],
    ['/trips', 'Minhas viagens'],
    ['/trips/new', 'Nova viagem'],
    ['/trips/1', 'Viagem'],
    ['/trips/1/edit', 'Editar viagem'],
    ['/join', 'Entrar com código'],
    ['/reviews', 'Avaliações'],
    ['/notifications', 'Avisos'],
    ['/profile', 'Perfil'],
  ])('renders the page for %s', async (path, heading) => {
    renderAt(path)

    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument()
  })

  it('shows the 404 page for an unknown address', () => {
    renderAt('/does-not-exist')

    expect(screen.getByRole('heading', { name: 'Página não encontrada' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar para o início' })).toHaveAttribute('href', '/')
  })

  it('keeps login outside the main layout for visitors', () => {
    renderAt('/login', routes, makeAuthValue({ status: 'unauthenticated', user: null }))

    expect(screen.getByRole('heading', { level: 1, name: 'Entrar' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('redirects an authenticated user away from /login to /trips', () => {
    renderAt('/login', routes, makeAuthValue())

    expect(screen.getByRole('heading', { level: 1, name: 'Minhas viagens' })).toBeInTheDocument()
  })

  it('navigates through the top menu and highlights the active item', async () => {
    renderAt('/')
    const topNav = screen.getByRole('navigation', { name: 'Navegação principal' })

    expect(within(topNav).queryByRole('link', { current: 'page' })).not.toBeInTheDocument()

    await userEvent.click(within(topNav).getByRole('link', { name: 'Minhas viagens' }))

    expect(screen.getByRole('heading', { level: 1, name: 'Minhas viagens' })).toBeInTheDocument()
    expect(within(topNav).getByRole('link', { name: 'Minhas viagens' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('highlights "Minhas viagens" for a visitor too, since the page stays in the layout', async () => {
    renderAt('/', routes, makeAuthValue({ status: 'unauthenticated', user: null }))
    const topNav = screen.getByRole('navigation', { name: 'Navegação principal' })

    await userEvent.click(within(topNav).getByRole('link', { name: 'Minhas viagens' }))

    expect(within(topNav).getByRole('link', { name: 'Minhas viagens' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('heading', { name: 'Entre para continuar' })).toBeInTheDocument()
  })

  it('keeps the section highlighted on its sub-pages', () => {
    renderAt('/trips/new')
    const topNav = screen.getByRole('navigation', { name: 'Navegação principal' })

    expect(within(topNav).getByRole('link', { name: 'Minhas viagens' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('offers the four destinations in the bottom bar', () => {
    renderAt('/destinations')
    const bottomNav = screen.getByRole('navigation', { name: 'Navegação inferior' })
    const links = within(bottomNav).getAllByRole('link')

    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/trips',
      '/destinations',
      '/notifications',
      '/profile',
    ])
    expect(within(bottomNav).getByRole('link', { name: 'Descobrir' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it.each(['/', '/destinations', '/destinations/1', '/activities/1', '/trips'])(
    'shows the site footer on the full width page %s',
    (path) => {
      renderAt(path)

      expect(screen.getByRole('contentinfo')).toHaveTextContent('ViajaJunto')
    },
  )

  it.each(['/trips/new', '/profile', '/reviews'])('has no site footer on %s', (path) => {
    renderAt(path)

    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
  })

  it('offers the account links in the footer according to the session', () => {
    renderAt('/', routes, makeAuthValue({ status: 'unauthenticated', user: null }))
    const footer = within(screen.getByRole('contentinfo'))

    expect(footer.getByRole('link', { name: 'Fazer login' })).toHaveAttribute('href', '/login')
    expect(footer.queryByRole('link', { name: 'Meu perfil' })).not.toBeInTheDocument()
  })

  it('shows the profile link in the footer to a signed-in user', () => {
    renderAt('/')

    expect(
      within(screen.getByRole('contentinfo')).getByRole('link', { name: 'Meu perfil' }),
    ).toHaveAttribute('href', '/profile')
  })

  it.each(['/', '/destinations', '/destinations/1', '/trips', '/profile', '/does-not-exist'])(
    'has a white top bar with the ruby brand on %s',
    (path) => {
      renderAt(path)
      const topBar = screen.getAllByRole('banner')[0]

      expect(topBar).toHaveClass('bg-white')
      expect(within(topBar).getByText('ViajaJunto')).toHaveClass('text-red-ruby')
    },
  )

  it.each(['/destinations', '/destinations/1', '/trips', '/profile', '/does-not-exist'])(
    'separates the top bar with a soft shadow on %s',
    (path) => {
      renderAt(path)

      expect(screen.getAllByRole('banner')[0]).toHaveClass('shadow-md')
    },
  )

  it('has no shadow under the top bar on the home page', () => {
    renderAt('/')

    expect(screen.getAllByRole('banner')[0]).not.toHaveClass('shadow-md')
  })

  it('uses the same solid sign-in button outside the home page', () => {
    renderAt('/reviews', routes, makeAuthValue({ status: 'unauthenticated', user: null }))

    expect(
      within(screen.getAllByRole('banner')[0]).getByRole('link', { name: 'Entrar' }),
    ).toHaveClass('bg-red-burgundy')
  })

  it('keeps the public pages open for visitors', () => {
    renderAt('/destinations', routes, makeAuthValue({ status: 'unauthenticated', user: null }))

    expect(screen.getByRole('heading', { level: 1, name: 'Destinos' })).toBeInTheDocument()
  })

  it.each([
    '/trips',
    '/trips/new',
    '/trips/1',
    '/trips/1/edit',
    '/join',
    '/notifications',
    '/profile',
  ])('keeps a visitor on the private page %s and asks them to sign in', (path) => {
    const router = renderAt(path, routes, makeAuthValue({ status: 'unauthenticated', user: null }))

    expect(router.state.location.pathname).toBe(path)
    expect(screen.getByRole('heading', { name: 'Entre para continuar' })).toBeInTheDocument()
    expect(within(screen.getByRole('main')).getByRole('link', { name: 'Entrar' })).toHaveAttribute(
      'href',
      '/login',
    )
  })

  it('shows the user initials and notifications in the top bar when signed in', () => {
    renderAt('/')

    expect(screen.getByRole('link', { name: 'Perfil de Gustavo Fidelis' })).toHaveTextContent('GF')
    expect(screen.getByRole('link', { name: 'Notificações' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Entrar' })).not.toBeInTheDocument()
  })

  it('shows a sign-in button in the top bar for a visitor', () => {
    renderAt('/', routes, makeAuthValue({ status: 'unauthenticated', user: null }))

    const topBar = within(screen.getByRole('banner'))

    expect(topBar.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/login')
    expect(screen.queryByRole('link', { name: 'Notificações' })).not.toBeInTheDocument()
  })

  it('shows neither buttons nor initials while the session is being checked', () => {
    renderAt('/', routes, makeAuthValue({ status: 'loading', user: null }))

    expect(screen.queryByRole('link', { name: 'Entrar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Notificações' })).not.toBeInTheDocument()
  })

  it('signs the user out from the profile page and goes back to the home page', async () => {
    const auth = makeAuthValue()
    const router = renderAt('/profile', routes, auth)
    let pathWhenSigningOut = ''
    vi.mocked(auth.signOut).mockImplementation(async () => {
      pathWhenSigningOut = router.state.location.pathname
    })

    expect(screen.getByText('gustavo@exemplo.com')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Sair' }))

    expect(auth.signOut).toHaveBeenCalledOnce()
    // já está na home quando a sessão é limpa, então a guarda não redireciona para o login
    expect(pathWhenSigningOut).toBe('/')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Sua viagem começa aqui.' }),
    ).toBeInTheDocument()
  })

  it('shows the error page inside the layout when a route breaks', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    function Broken(): never {
      throw new Error('boom')
    }

    renderAt('/', [
      {
        element: <AppLayout />,
        children: [{ errorElement: <ErrorPage />, children: [{ path: '/', element: <Broken /> }] }],
      },
    ])

    expect(screen.getByRole('alert')).toHaveTextContent('Algo deu errado')
    expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument()
  })
})
