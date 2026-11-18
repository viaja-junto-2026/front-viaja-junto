import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router'
import { AppLayout } from '../layouts/AppLayout'
import ErrorPage from '../pages/ErrorPage'
import { routes } from './routes'

function renderAt(path: string, routeObjects: RouteObject[] = routes) {
  const router = createMemoryRouter(routeObjects, { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

describe('routes', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it.each([
    ['/', 'Início'],
    ['/login', 'Entrar'],
    ['/auth/callback', 'Entrando...'],
    ['/destinations', 'Destinos'],
    ['/destinations/1', 'Destino'],
    ['/activities/1', 'Atividade'],
    ['/trips', 'Minhas viagens'],
    ['/trips/new', 'Nova viagem'],
    ['/trips/1', 'Viagem'],
    ['/trips/1/edit', 'Editar viagem'],
    ['/join', 'Entrar com código'],
    ['/reviews', 'Avaliações'],
    ['/notifications', 'Avisos'],
    ['/profile', 'Perfil'],
  ])('renders the page for %s', (path, heading) => {
    renderAt(path)

    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument()
  })

  it('shows the 404 page for an unknown address', () => {
    renderAt('/does-not-exist')

    expect(screen.getByRole('heading', { name: 'Página não encontrada' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar para o início' })).toHaveAttribute('href', '/')
  })

  it('keeps login outside the main layout', () => {
    renderAt('/login')

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
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
