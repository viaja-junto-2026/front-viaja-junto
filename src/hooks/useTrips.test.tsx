import { QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../auth/authContext'
import { listTrips } from '../services/trips'
import { makeAuthValue } from '../test/auth'
import { createTestQueryClient } from '../test/query'
import { makePaginatedTrips, makeTrip } from '../test/trips'
import { useTrips } from './useTrips'

vi.mock('../services/trips', () => ({ listTrips: vi.fn() }))

function renderTrips() {
  const client = createTestQueryClient()
  return renderHook(() => useTrips(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>
        <AuthContext.Provider value={makeAuthValue()}>{children}</AuthContext.Provider>
      </QueryClientProvider>
    ),
  })
}

describe('useTrips', () => {
  beforeEach(() => {
    vi.mocked(listTrips).mockReset()
  })

  it('loads the first page without a status filter', async () => {
    vi.mocked(listTrips).mockResolvedValue(makePaginatedTrips([makeTrip()]))

    const { result } = renderTrips()
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.items).toHaveLength(1))
    expect(listTrips).toHaveBeenCalledWith({ page: 1, limit: 9, status: undefined })
    expect(result.current.isEmpty).toBe(false)
  })

  it('goes back to the first page when the status changes', async () => {
    vi.mocked(listTrips).mockResolvedValue(
      makePaginatedTrips([makeTrip()], { totalPages: 3, hasNext: true }),
    )
    const { result } = renderTrips()
    await waitFor(() => expect(result.current.items).toHaveLength(1))

    act(() => result.current.setPage(2))
    await waitFor(() =>
      expect(listTrips).toHaveBeenLastCalledWith({ page: 2, limit: 9, status: undefined }),
    )

    act(() => result.current.setStatus('COMPLETED'))
    await waitFor(() =>
      expect(listTrips).toHaveBeenLastCalledWith({ page: 1, limit: 9, status: 'COMPLETED' }),
    )
    expect(result.current.status).toBe('COMPLETED')
  })

  it('exposes the error and refetches', async () => {
    vi.mocked(listTrips).mockRejectedValueOnce(new Error('falhou'))
    const { result } = renderTrips()
    await waitFor(() => expect(result.current.isError).toBe(true))

    vi.mocked(listTrips).mockResolvedValue(makePaginatedTrips())
    await act(() => result.current.refetch())

    await waitFor(() => expect(result.current.items).toHaveLength(1))
  })
})
