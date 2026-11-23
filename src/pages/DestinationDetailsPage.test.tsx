import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listActivities } from '../services/activities'
import { ApiError } from '../services/apiError'
import { getDestinationDetails } from '../services/destinations'
import { makeActivity, makePaginatedActivities, makePublicReview } from '../test/activities'
import { makeDestinationDetails } from '../test/destinations'
import { createTestQueryClient } from '../test/query'
import DestinationDetailsPage from './DestinationDetailsPage'

vi.mock('../services/destinations', () => ({ getDestinationDetails: vi.fn() }))
vi.mock('../services/activities', () => ({ listActivities: vi.fn() }))

function renderPage(initialEntry = '/destinations/d1') {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/destinations/:id" element={<DestinationDetailsPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('DestinationDetailsPage', () => {
  beforeEach(() => {
    vi.mocked(getDestinationDetails).mockReset()
    vi.mocked(listActivities).mockReset()
  })

  it('shows a loading skeleton while the destination details are loading', () => {
    vi.mocked(getDestinationDetails).mockReturnValue(new Promise(() => {}))
    renderPage()

    expect(screen.getByRole('status')).toHaveTextContent('Carregando detalhes do destino')
    expect(listActivities).not.toHaveBeenCalled()
  })

  it('renders destination details, activities with links, and public reviews', async () => {
    vi.mocked(getDestinationDetails).mockResolvedValue(
      makeDestinationDetails({
        id: 'paris',
        name: 'Paris',
        country: 'França',
        category: 'CITY',
        description: 'Capital da França, conhecida pelos museus e pela gastronomia.',
        averageRating: 4.7,
        reviewCount: 38,
        latestReviews: [
          makePublicReview({
            id: 'r1',
            authorName: 'Gustavo Fidelis',
            comment: 'Cidade inesquecível.',
          }),
        ],
      }),
    )
    vi.mocked(listActivities).mockResolvedValue(
      makePaginatedActivities([
        makeActivity({ id: 'louvre', name: 'Museu do Louvre', type: 'TOUR' }),
      ]),
    )

    renderPage('/destinations/paris')

    expect(await screen.findByRole('heading', { level: 1, name: 'Paris' })).toBeInTheDocument()
    expect(screen.getByText('Cidade')).toBeInTheDocument()
    expect(screen.getByText('França')).toBeInTheDocument()
    expect(
      screen.getByText('Capital da França, conhecida pelos museus e pela gastronomia.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Paris' })).toHaveAttribute(
      'src',
      'https://img.test/paris.jpg',
    )
    expect(screen.getByRole('img', { name: 'Nota 4,7 de 5' })).toHaveTextContent('4,7')

    const activitiesSection = screen.getByRole('region', { name: 'Atividades' })
    const louvreLink = await within(activitiesSection).findByRole('link', {
      name: /Museu do Louvre/,
    })
    expect(louvreLink).toHaveAttribute('href', '/activities/louvre')

    const reviewsSection = screen.getByRole('region', { name: 'Avaliações' })
    expect(within(reviewsSection).getByText('Gustavo Fidelis')).toBeInTheDocument()
    expect(within(reviewsSection).getByText('Cidade inesquecível.')).toBeInTheDocument()
  })

  it('filters activities by type, minimum rating, and sort order, and clears filters on empty results', async () => {
    vi.mocked(getDestinationDetails).mockResolvedValue(
      makeDestinationDetails({ id: 'paris', latestReviews: [], reviewCount: 0 }),
    )
    vi.mocked(listActivities)
      .mockResolvedValueOnce(
        makePaginatedActivities([makeActivity({ id: 'a1', name: 'Museu do Louvre' })]),
      )
      .mockResolvedValueOnce(
        makePaginatedActivities([
          makeActivity({ id: 'a2', name: 'Bistrô da Praça', type: 'FOOD' }),
        ]),
      )
      .mockResolvedValueOnce(makePaginatedActivities([]))
      .mockResolvedValueOnce(makePaginatedActivities([]))
      .mockResolvedValueOnce(
        makePaginatedActivities([makeActivity({ id: 'a1', name: 'Museu do Louvre' })]),
      )

    renderPage('/destinations/paris')
    const activitiesSection = await screen.findByRole('region', { name: 'Atividades' })

    expect(
      await within(activitiesSection).findByRole('link', { name: /Museu do Louvre/ }),
    ).toBeInTheDocument()

    // Filtra por tipo "Comida"
    await userEvent.click(within(activitiesSection).getByRole('button', { name: 'Comida' }))
    await waitFor(() =>
      expect(listActivities).toHaveBeenLastCalledWith({
        destinationId: 'paris',
        type: 'FOOD',
        sort: 'name',
        page: 1,
        limit: 9,
      }),
    )

    // Filtra por nota mínima "4+ estrelas"
    await userEvent.click(within(activitiesSection).getByRole('combobox', { name: 'Nota mínima' }))
    await userEvent.click(screen.getByRole('option', { name: '4+ estrelas' }))
    await waitFor(() =>
      expect(listActivities).toHaveBeenLastCalledWith({
        destinationId: 'paris',
        type: 'FOOD',
        minRating: 4,
        sort: 'name',
        page: 1,
        limit: 9,
      }),
    )

    // Ordena por "Melhor avaliadas"
    await userEvent.click(within(activitiesSection).getByRole('combobox', { name: 'Ordenar por' }))
    await userEvent.click(screen.getByRole('option', { name: 'Melhor avaliadas' }))
    await waitFor(() =>
      expect(listActivities).toHaveBeenLastCalledWith({
        destinationId: 'paris',
        type: 'FOOD',
        minRating: 4,
        sort: 'rating',
        page: 1,
        limit: 9,
      }),
    )

    expect(
      await within(activitiesSection).findByRole('heading', {
        name: 'Nenhuma atividade encontrada com esses filtros',
      }),
    ).toBeInTheDocument()

    // Limpa os filtros
    await userEvent.click(within(activitiesSection).getByRole('button', { name: 'Limpar filtros' }))
    await waitFor(() =>
      expect(listActivities).toHaveBeenLastCalledWith({
        destinationId: 'paris',
        type: undefined,
        minRating: undefined,
        sort: 'rating',
        page: 1,
        limit: 9,
      }),
    )
  })

  it('paginates through destination activities', async () => {
    vi.mocked(getDestinationDetails).mockResolvedValue(makeDestinationDetails({ id: 'paris' }))
    vi.mocked(listActivities)
      .mockResolvedValueOnce(
        makePaginatedActivities([makeActivity({ id: 'a1', name: 'Atividade 1' })], {
          page: 1,
          limit: 9,
          total: 12,
          totalPages: 2,
          hasNext: true,
          hasPrevious: false,
        }),
      )
      .mockResolvedValueOnce(
        makePaginatedActivities([makeActivity({ id: 'a2', name: 'Atividade 2' })], {
          page: 2,
          limit: 9,
          total: 12,
          totalPages: 2,
          hasNext: false,
          hasPrevious: true,
        }),
      )

    renderPage('/destinations/paris')

    expect(await screen.findByRole('link', { name: /Atividade 1/ })).toBeInTheDocument()
    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Próxima' }))

    expect(await screen.findByRole('link', { name: /Atividade 2/ })).toBeInTheDocument()
    expect(screen.getByText('Página 2 de 2')).toBeInTheDocument()
    expect(listActivities).toHaveBeenLastCalledWith({
      destinationId: 'paris',
      sort: 'name',
      page: 2,
      limit: 9,
    })
  })

  it('shows empty states for activities and reviews and falls back when photo fails', async () => {
    vi.mocked(getDestinationDetails).mockResolvedValue(
      makeDestinationDetails({
        photoUrl: 'https://img.test/broken.jpg',
        averageRating: null,
        reviewCount: 0,
        category: null,
        country: null,
        description: null,
        latestReviews: [],
      }),
    )
    vi.mocked(listActivities).mockResolvedValue(makePaginatedActivities([]))

    renderPage()

    const photo = await screen.findByRole('img', { name: 'Paris' })
    fireEvent.error(photo)

    expect(screen.queryByRole('img', { name: 'Paris' })).not.toBeInTheDocument()
    expect(screen.getByText('Ainda sem nota média')).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: 'Ainda não há atividades cadastradas' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Ainda não há avaliações' })).toBeInTheDocument()
  })

  it('shows the not-found message when the API returns 404 or 400', async () => {
    vi.mocked(getDestinationDetails).mockRejectedValueOnce(ApiError.fromResponse(404))
    const { unmount } = renderPage('/destinations/00000000-0000-4000-8000-000000000000')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Destino não encontrado' }),
    ).toBeInTheDocument()
    expect(listActivities).not.toHaveBeenCalled()

    unmount()
    vi.mocked(getDestinationDetails).mockRejectedValueOnce(ApiError.fromResponse(400))
    renderPage('/destinations/id-invalido')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Destino não encontrado' }),
    ).toBeInTheDocument()
  })

  it('shows the error state on server failure and retries on click', async () => {
    vi.mocked(getDestinationDetails).mockRejectedValueOnce(ApiError.fromResponse(500))
    vi.mocked(listActivities).mockResolvedValue(makePaginatedActivities([]))

    renderPage('/destinations/paris')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'O servidor está com problemas. Tente de novo em instantes.',
    )

    vi.mocked(getDestinationDetails).mockResolvedValue(makeDestinationDetails({ name: 'Paris' }))
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Paris' })).toBeInTheDocument()
  })
})
