import { QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, useLocation } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listDestinations } from '../services/destinations'
import { makeDestination, makePaginatedDestinations } from '../test/destinations'
import { createTestQueryClient } from '../test/query'
import { useDestinations } from './useDestinations'

vi.mock('../services/destinations', () => ({ listDestinations: vi.fn() }))

function createRouterWrapper(initialEntry = '/destinations') {
  const client = createTestQueryClient()
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }
}

describe('useDestinations', () => {
  beforeEach(() => {
    vi.mocked(listDestinations).mockReset()
  })

  it('reads initial filters and page from the URL search params', async () => {
    vi.mocked(listDestinations).mockResolvedValue(
      makePaginatedDestinations([makeDestination({ id: 'p1', name: 'Paris' })], {
        page: 2,
        total: 15,
        totalPages: 2,
        hasPrevious: true,
      }),
    )

    const { result } = renderHook(() => useDestinations(), {
      wrapper: createRouterWrapper('/destinations?q=Paris&country=FR&category=CITY&page=2'),
    })

    await waitFor(() => expect(result.current.items).toHaveLength(1))
    expect(result.current.filters).toEqual({ q: 'Paris', country: 'FR', category: 'CITY' })
    expect(result.current.page).toBe(2)
    expect(result.current.hasActiveFilters).toBe(true)
    expect(listDestinations).toHaveBeenCalledWith({
      page: 2,
      limit: 12,
      q: 'Paris',
      country: 'FR',
      category: 'CITY',
    })
  })

  it('falls back gracefully on invalid category and page values in the URL', async () => {
    vi.mocked(listDestinations).mockResolvedValue(makePaginatedDestinations([]))

    const { result } = renderHook(() => useDestinations(), {
      wrapper: createRouterWrapper('/destinations?category=UNKNOWN&page=-3'),
    })

    await waitFor(() => expect(result.current.isEmpty).toBe(true))
    expect(result.current.filters.category).toBeUndefined()
    expect(result.current.page).toBe(1)
  })

  it('updates URL params on setFilters (resetting page) and preserves filters on setPage', async () => {
    vi.mocked(listDestinations).mockResolvedValue(
      makePaginatedDestinations([makeDestination()], {
        page: 1,
        total: 24,
        totalPages: 2,
        hasNext: true,
      }),
    )

    const { result } = renderHook(
      () => ({ destinations: useDestinations(), location: useLocation() }),
      { wrapper: createRouterWrapper('/destinations?page=2') },
    )

    await waitFor(() => expect(result.current.destinations.items).toHaveLength(1))

    act(() => result.current.destinations.setFilters({ q: 'Rio', category: 'BEACH' }))
    await waitFor(() => expect(result.current.location.search).toBe('?q=Rio&category=BEACH'))
    expect(result.current.destinations.page).toBe(1)

    act(() => result.current.destinations.setPage(2))
    await waitFor(() => expect(result.current.location.search).toBe('?q=Rio&category=BEACH&page=2'))

    act(() => result.current.destinations.clearFilters())
    await waitFor(() => expect(result.current.location.search).toBe(''))
  })
})
