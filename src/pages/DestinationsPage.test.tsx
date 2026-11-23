import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../services/apiError'
import { listDestinations } from '../services/destinations'
import { makeDestination, makePaginatedDestinations } from '../test/destinations'
import { createTestQueryClient } from '../test/query'
import DestinationsPage from './DestinationsPage'

vi.mock('../services/destinations', () => ({ listDestinations: vi.fn() }))

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>
}

function renderPage(initialEntry = '/destinations') {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route
            path="/destinations"
            element={
              <>
                <DestinationsPage />
                <LocationDisplay />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('DestinationsPage', () => {
  beforeEach(() => {
    vi.mocked(listDestinations).mockReset()
  })

  it('shows a loading skeleton while fetching destinations', () => {
    vi.mocked(listDestinations).mockReturnValue(new Promise(() => {}))
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'Destinos' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Carregando destinos')
  })

  it('renders destination cards linking to /destinations/:id', async () => {
    vi.mocked(listDestinations).mockResolvedValue(
      makePaginatedDestinations(
        [
          makeDestination({ id: 'paris', name: 'Paris', country: 'França' }),
          makeDestination({ id: 'kyoto', name: 'Kyoto', country: 'Japão' }),
        ],
        { total: 2 },
      ),
    )

    renderPage()

    const list = await screen.findByRole('list', { name: 'Lista de destinos' })
    expect(within(list).getByRole('link', { name: /Paris/ })).toHaveAttribute(
      'href',
      '/destinations/paris',
    )
    expect(within(list).getByRole('link', { name: /Kyoto/ })).toHaveAttribute(
      'href',
      '/destinations/kyoto',
    )
    expect(screen.getByText('2 destinos encontrados')).toBeInTheDocument()
  })

  it('filters by name, country, and category, syncs the URL, and preserves filters across pages', async () => {
    vi.mocked(listDestinations)
      .mockResolvedValueOnce(
        makePaginatedDestinations([makeDestination({ id: 'd1', name: 'Paris' })]),
      )
      .mockResolvedValueOnce(
        makePaginatedDestinations(
          [makeDestination({ id: 'd2', name: 'Nice', country: 'França' })],
          {
            page: 1,
            total: 24,
            totalPages: 2,
            hasNext: true,
          },
        ),
      )
      .mockResolvedValueOnce(
        makePaginatedDestinations(
          [makeDestination({ id: 'd2', name: 'Nice', country: 'França' })],
          {
            page: 1,
            total: 24,
            totalPages: 2,
            hasNext: true,
          },
        ),
      )
      .mockResolvedValueOnce(
        makePaginatedDestinations(
          [makeDestination({ id: 'd3', name: 'Cannes', country: 'França' })],
          {
            page: 2,
            total: 24,
            totalPages: 2,
            hasPrevious: true,
            hasNext: false,
          },
        ),
      )

    renderPage()
    await screen.findByRole('link', { name: /Paris/ })

    await userEvent.type(screen.getByLabelText('Buscar destino'), 'Nice')
    await userEvent.type(screen.getByLabelText('País'), 'França')
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }))

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/destinations?q=Nice&country=Fran%C3%A7a',
      ),
    )

    await userEvent.click(screen.getByRole('button', { name: 'Praia' }))
    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/destinations?q=Nice&country=Fran%C3%A7a&category=BEACH',
      ),
    )

    await userEvent.click(screen.getByRole('button', { name: 'Próxima' }))
    expect(await screen.findByRole('link', { name: /Cannes/ })).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/destinations?q=Nice&country=Fran%C3%A7a&category=BEACH&page=2',
    )
    expect(listDestinations).toHaveBeenLastCalledWith({
      page: 2,
      limit: 12,
      q: 'Nice',
      country: 'França',
      category: 'BEACH',
    })
  })

  it('restores state from URL query string and clears filters from the empty state', async () => {
    vi.mocked(listDestinations)
      .mockResolvedValueOnce(makePaginatedDestinations([]))
      .mockResolvedValueOnce(
        makePaginatedDestinations([makeDestination({ id: 'd1', name: 'Paris' })]),
      )

    renderPage('/destinations?q=Atlantida&category=BEACH')

    expect(screen.getByLabelText('Buscar destino')).toHaveValue('Atlantida')
    expect(
      await screen.findByRole('heading', { name: 'Nenhum destino encontrado' }),
    ).toBeInTheDocument()

    const clearButtons = screen.getAllByRole('button', { name: 'Limpar filtros' })
    await userEvent.click(clearButtons[clearButtons.length - 1])

    expect(await screen.findByRole('link', { name: /Paris/ })).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/destinations')
    expect(screen.getByLabelText('Buscar destino')).toHaveValue('')
  })

  it('shows an error alert and retries when clicking "Tentar de novo"', async () => {
    vi.mocked(listDestinations).mockRejectedValueOnce(ApiError.fromResponse(500))
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'O servidor está com problemas. Tente de novo em instantes.',
    )

    vi.mocked(listDestinations).mockResolvedValue(
      makePaginatedDestinations([makeDestination({ id: 'd1', name: 'Paris' })]),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))

    expect(await screen.findByRole('link', { name: /Paris/ })).toBeInTheDocument()
  })
})
