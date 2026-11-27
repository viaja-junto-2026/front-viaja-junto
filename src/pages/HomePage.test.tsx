import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext, type AuthContextValue } from '../auth/authContext'
import { listActivities } from '../services/activities'
import { ApiError } from '../services/apiError'
import { listTopDestinations } from '../services/destinations'
import { makeActivity, makePaginatedActivities } from '../test/activities'
import { makeAuthValue } from '../test/auth'
import { makeDestination } from '../test/destinations'
import { createTestQueryClient } from '../test/query'
import HomePage from './HomePage'

vi.mock('../services/destinations', () => ({ listTopDestinations: vi.fn() }))
vi.mock('../services/activities', () => ({ listActivities: vi.fn() }))

function renderHome(auth: AuthContextValue = makeAuthValue()) {
  const router = createMemoryRouter([
    { path: '/', element: <HomePage /> },
    { path: '*', element: <p>outra página</p> },
  ])
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <AuthContext.Provider value={auth}>
        <RouterProvider router={router} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
  return router
}

const visitor = () => makeAuthValue({ status: 'unauthenticated', user: null })
const region = (name: string) => screen.getByRole('region', { name })
const destinationsRegion = () => region('Destinos mais bem avaliados')
const experiencesRegion = () => region('Experiências para inspirar')

describe('HomePage', () => {
  beforeEach(() => {
    vi.mocked(listTopDestinations).mockReset().mockResolvedValue([])
    vi.mocked(listActivities).mockReset().mockResolvedValue(makePaginatedActivities([]))
  })

  describe('hero', () => {
    it('shows the title, the text and the photo', () => {
      renderHome()

      expect(
        screen.getByRole('heading', { level: 1, name: 'Sua viagem começa aqui.' }),
      ).toBeInTheDocument()
      expect(screen.getByText(/Monte o roteiro com o seu grupo/)).toBeInTheDocument()
      expect(screen.getByRole('img', { name: /Pagode vermelho/ })).toBeInTheDocument()
    })

    it('offers "Nova viagem" and the catalog to a signed-in user', () => {
      renderHome()
      const hero = within(region('Sua viagem começa aqui.'))

      expect(hero.getByRole('link', { name: 'Nova viagem' })).toHaveAttribute('href', '/trips/new')
      expect(hero.getByRole('link', { name: 'Explorar destinos' })).toHaveAttribute(
        'href',
        '/destinations',
      )
      expect(hero.queryByRole('link', { name: 'Entrar' })).not.toBeInTheDocument()
    })

    it('offers "Entrar" to a visitor', () => {
      renderHome(visitor())
      const hero = within(region('Sua viagem começa aqui.'))

      expect(hero.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/login')
      expect(hero.queryByRole('link', { name: 'Nova viagem' })).not.toBeInTheDocument()
    })

    it('shows only the catalog link while the session is being checked', () => {
      renderHome(makeAuthValue({ status: 'loading', user: null }))
      const hero = within(region('Sua viagem começa aqui.'))

      expect(hero.getAllByRole('link')).toHaveLength(1)
    })
  })

  describe('search and features', () => {
    it('searches the catalog from the home', async () => {
      const router = renderHome()

      await userEvent.type(screen.getByRole('searchbox', { name: 'Para onde?' }), 'Paris')
      await userEvent.click(screen.getByRole('button', { name: 'Buscar destinos' }))

      expect(router.state.location.pathname).toBe('/destinations')
      expect(router.state.location.search).toBe('?q=Paris')
    })

    it('lists the four strengths of the product', () => {
      renderHome()
      const strip = within(region('Como o ViajaJunto ajuda'))

      expect(strip.getAllByRole('heading').map((heading) => heading.textContent)).toEqual([
        'Roteiro em grupo',
        'Orçamento claro',
        'Despesas divididas',
        'Lugares avaliados',
      ])
    })
  })

  describe('top destinations', () => {
    it('shows the skeleton while loading', () => {
      vi.mocked(listTopDestinations).mockReturnValue(new Promise(() => {}))
      renderHome()

      expect(within(destinationsRegion()).getByRole('status')).toHaveTextContent(
        'Carregando destinos',
      )
    })

    it('shows the three best destinations as cards that lead to their page', async () => {
      vi.mocked(listTopDestinations).mockResolvedValue([
        makeDestination({ id: 'a', name: 'Kyoto' }),
        makeDestination({ id: 'b', name: 'Lisboa', country: 'Portugal' }),
      ])
      renderHome()

      const link = await screen.findByRole('link', { name: 'Ver detalhes de Kyoto' })

      expect(link).toHaveAttribute('href', '/destinations/a')
      expect(screen.getByRole('link', { name: 'Ver detalhes de Lisboa' })).toHaveAttribute(
        'href',
        '/destinations/b',
      )
      expect(
        within(destinationsRegion()).getByRole('link', { name: 'Ver todos os destinos' }),
      ).toHaveAttribute('href', '/destinations')
      expect(listTopDestinations).toHaveBeenCalledWith({ limit: 3 })
    })

    it('shows an empty state when there are no rated destinations', async () => {
      renderHome()

      expect(
        await screen.findByRole('heading', { name: 'Ainda não há destinos avaliados' }),
      ).toBeInTheDocument()
    })

    it('shows the error in Portuguese and "Tentar de novo" calls the API again', async () => {
      vi.mocked(listTopDestinations).mockRejectedValueOnce(ApiError.fromResponse(500))
      renderHome()

      expect(await screen.findByRole('alert')).toHaveTextContent('O servidor está com problemas')

      vi.mocked(listTopDestinations).mockResolvedValue([makeDestination({ name: 'Kyoto' })])
      await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))

      expect(await screen.findByRole('link', { name: 'Ver detalhes de Kyoto' })).toBeInTheDocument()
      expect(listTopDestinations).toHaveBeenCalledTimes(2)
    })
  })

  describe('experiences', () => {
    it('shows real activities from the catalog, best rated first', async () => {
      vi.mocked(listActivities).mockResolvedValue(
        makePaginatedActivities([makeActivity({ id: 'a9', name: 'Museu do Louvre' })]),
      )
      renderHome()

      await waitFor(() =>
        expect(
          within(experiencesRegion()).getByRole('link', { name: /Museu do Louvre/ }),
        ).toHaveAttribute('href', '/activities/a9'),
      )
      expect(listActivities).toHaveBeenCalledWith({ page: 1, limit: 4, sort: 'rating' })
    })

    it('shows an empty state without activities', async () => {
      renderHome()

      expect(
        await screen.findByRole('heading', { name: 'Ainda não há atividades no catálogo' }),
      ).toBeInTheDocument()
    })

    it('shows the error and retries', async () => {
      vi.mocked(listActivities).mockRejectedValueOnce(new TypeError('Failed to fetch'))
      renderHome()

      expect(await screen.findByRole('alert')).toHaveTextContent('Sem conexão com o servidor')
      await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))

      await waitFor(() => expect(listActivities).toHaveBeenCalledTimes(2))
    })
  })

  describe('closing banner and footer', () => {
    it('invites a visitor to start', () => {
      renderHome(visitor())

      expect(
        within(region('Planeje a próxima viagem')).getByRole('link', { name: 'Começar agora' }),
      ).toHaveAttribute('href', '/login')
      expect(
        within(screen.getByRole('contentinfo')).getByRole('link', { name: 'Fazer login' }),
      ).toHaveAttribute('href', '/login')
    })

    it('sends a signed-in user to plan a trip', () => {
      renderHome()

      expect(
        within(region('Planeje a próxima viagem')).getByRole('link', { name: 'Planejar viagem' }),
      ).toHaveAttribute('href', '/trips/new')
      expect(
        within(screen.getByRole('contentinfo')).getByRole('link', { name: 'Meu perfil' }),
      ).toHaveAttribute('href', '/profile')
    })
  })
})
