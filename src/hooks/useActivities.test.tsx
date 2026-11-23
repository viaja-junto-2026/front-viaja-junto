import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listActivities } from '../services/activities'
import { makeActivity, makePaginatedActivities } from '../test/activities'
import { createQueryWrapper } from '../test/query'
import { useActivities } from './useActivities'

vi.mock('../services/activities', () => ({ listActivities: vi.fn() }))

describe('useActivities', () => {
  beforeEach(() => {
    vi.mocked(listActivities).mockReset()
  })

  it('loads paginated activities and resets to page 1 when filters change', async () => {
    const page1 = makePaginatedActivities([makeActivity({ id: 'a1' })], {
      page: 1,
      limit: 9,
      total: 12,
      totalPages: 2,
      hasNext: true,
    })
    const page2 = makePaginatedActivities([makeActivity({ id: 'a2' })], {
      page: 2,
      limit: 9,
      total: 12,
      totalPages: 2,
      hasPrevious: true,
    })
    const filtered = makePaginatedActivities([makeActivity({ id: 'a3', type: 'FOOD' })], {
      page: 1,
      limit: 9,
      total: 1,
      totalPages: 1,
    })

    vi.mocked(listActivities)
      .mockResolvedValueOnce(page1)
      .mockResolvedValueOnce(page2)
      .mockResolvedValueOnce(filtered)

    const { result } = renderHook(
      () => useActivities({ initialFilters: { destinationId: 'd1' } }),
      {
        wrapper: createQueryWrapper(),
      },
    )

    await waitFor(() => expect(result.current.items[0]?.id).toBe('a1'))
    expect(listActivities).toHaveBeenCalledWith({ destinationId: 'd1', page: 1, limit: 9 })

    act(() => result.current.setPage(2))
    await waitFor(() => expect(result.current.items[0]?.id).toBe('a2'))

    act(() => result.current.setFilters({ type: 'FOOD', minRating: 4 }))
    await waitFor(() => expect(result.current.items[0]?.id).toBe('a3'))
    expect(result.current.page).toBe(1)
    expect(listActivities).toHaveBeenLastCalledWith({
      destinationId: 'd1',
      type: 'FOOD',
      minRating: 4,
      page: 1,
      limit: 9,
    })
  })

  it('does not fetch when disabled', () => {
    renderHook(() => useActivities({ enabled: false }), { wrapper: createQueryWrapper() })
    expect(listActivities).not.toHaveBeenCalled()
  })
})
