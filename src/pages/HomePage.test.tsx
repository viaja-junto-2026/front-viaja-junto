import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext, type AuthContextValue } from '../auth/authContext'
import { ApiError } from '../services/apiError'
import { listTopDestinations } from '../services/destinations'
import { makeAuthValue } from '../test/auth'
import { makeDestination } from '../test/destinations'
import { createTestQueryClient } from '../test/query'
import HomePage from './HomePage'

vi.mock('../services/destinations', () => ({ listTopDestinations: vi.fn() }))

function renderHome(auth: AuthContextValue = makeAuthValue()) {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <AuthContext.Provider value={auth}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
}

const visitor = () => makeAuthValue({ status: 'unauthenticated', user: null })

describe('HomePage', () => {
  beforeEach(() => {
    vi.mocked(listTopDestinations).mockReset()
    vi.mocked(listTopDestinations).mockResolvedValue([])
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

    it('offers "Nova viagem" to a signed-in user', () => {
      renderHome(makeAuthValue())

      expect(screen.getByRole('link', { name: 'Nova viagem' })).toHaveAttribute(
        'href',
        '/trips/new',
      )
      expect(screen.queryByRole('link', { name: 'Entrar' })).not.toBeInTheDocument()
    })

    it('offers "Entrar" to a visitor', () => {
      renderHome(visitor())

      expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/login')
      expect(screen.queryByRole('link', { name: 'Nova viagem' })).not.toBeInTheDocument()
    })

    it('shows no button while the session is being checked', () => {
      renderHome(makeAuthValue({ status: 'loading', user: null }))

      expect(screen.queryByRole('link', { name: 'Entrar' })).not.toBeInTheDocument()
      expect(screen.queryByRole('link', { name: 'Nova viagem' })).not.toBeInTheDocument()
    })

    it('highlights the best rated destination on the photo', async () => {
      vi.mocked(listTopDestinations).mockResolvedValue([
        makeDestination({ id: 'best', name: 'Kyoto', averageRating: 4.9 }),
        makeDestination({ id: 'other', name: 'Lisboa' }),
      ])
      renderHome()

      const featured = await screen.findByRole('article')

      expect(within(featured).getByText('Mais bem avaliado')).toBeInTheDocument()
      expect(within(featured).getByText('Kyoto')).toBeInTheDocument()
      expect(within(featured).getByText('4,9')).toBeInTheDocument()
      expect(within(featured).getByRole('link')).toHaveAttribute('href', '/destinations/best')
    })

    it('highlights a destination without country or rating', async () => {
      vi.mocked(listTopDestinations).mockResolvedValue([
        makeDestination({ country: null, averageRating: null }),
      ])
      renderHome()

      const featured = await screen.findByRole('article')

      expect(within(featured).getByText('Kyoto')).toBeInTheDocument()
      expect(within(featured).queryByText('Japão')).not.toBeInTheDocument()
    })
  })

  describe('features', () => {
    it('lists the three strengths of the product', () => {
      renderHome()
      const strip = screen.getByRole('region', { name: 'Como o ViajaJunto ajuda' })

      expect(within(strip).getByRole('heading', { name: 'Planeje junto' })).toBeInTheDocument()
      expect(
        within(strip).getByRole('heading', { name: 'Controle o orçamento' }),
      ).toBeInTheDocument()
      expect(within(strip).getByRole('heading', { name: 'Descubra lugares' })).toBeInTheDocument()
    })
  })

  describe('top destinations', () => {
    const section = () => screen.getByRole('region', { name: 'Destinos mais bem avaliados' })

    it('shows the skeleton while loading', () => {
      vi.mocked(listTopDestinations).mockReturnValue(new Promise(() => {}))
      renderHome()

      expect(within(section()).getByRole('status')).toHaveTextContent('Carregando destinos')
      expect(within(section()).getByRole('link', { name: 'Ver todas' })).toBeInTheDocument()
    })

    it('shows the real destinations as cards that lead to their page', async () => {
      vi.mocked(listTopDestinations).mockResolvedValue([
        makeDestination({ id: 'a', name: 'Kyoto' }),
        makeDestination({ id: 'b', name: 'Lisboa', country: 'Portugal' }),
      ])
      renderHome()

      await waitFor(() =>
        expect(within(section()).getByRole('link', { name: /Kyoto/ })).toBeInTheDocument(),
      )
      const kyoto = within(section()).getByRole('link', { name: /Kyoto/ })

      expect(kyoto).toHaveAttribute('href', '/destinations/a')
      expect(within(section()).getByRole('link', { name: /Lisboa/ })).toHaveAttribute(
        'href',
        '/destinations/b',
      )
      expect(within(section()).getByRole('link', { name: 'Ver todas' })).toHaveAttribute(
        'href',
        '/destinations',
      )
      expect(listTopDestinations).toHaveBeenCalledWith({ limit: 10 })
    })

    it('shows a useful empty state when there are no rated destinations', async () => {
      renderHome()

      expect(
        await screen.findByRole('heading', { name: 'Ainda não há destinos avaliados' }),
      ).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Explorar destinos' })).toHaveAttribute(
        'href',
        '/destinations',
      )
    })

    it('shows the error in Portuguese and "Tentar de novo" calls the API again', async () => {
      vi.mocked(listTopDestinations).mockRejectedValueOnce(ApiError.fromResponse(500))
      renderHome()

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'O servidor está com problemas. Tente de novo em instantes.',
      )

      vi.mocked(listTopDestinations).mockResolvedValue([makeDestination({ name: 'Kyoto' })])
      await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))

      await waitFor(() =>
        expect(within(section()).getByRole('link', { name: /Kyoto/ })).toBeInTheDocument(),
      )
      expect(listTopDestinations).toHaveBeenCalledTimes(2)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('explains a network failure', async () => {
      vi.mocked(listTopDestinations).mockRejectedValue(new TypeError('Failed to fetch'))
      renderHome()

      expect(await screen.findByRole('alert')).toHaveTextContent('Sem conexão com o servidor')
    })
  })
})
