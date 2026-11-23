import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listReviews } from '../services/reviews'
import { createQueryWrapper } from '../test/query'
import { makeActivityReview, makePaginatedReviews } from '../test/reviews'
import { useActivityReviews } from './useActivityReviews'

vi.mock('../services/reviews', () => ({ listReviews: vi.fn() }))

describe('useActivityReviews', () => {
  beforeEach(() => {
    vi.mocked(listReviews).mockReset()
  })

  it('loads paginated reviews for an activity and advances pages', async () => {
    const page1 = makePaginatedReviews([makeActivityReview({ id: 'r1' })], {
      page: 1,
      limit: 5,
      total: 6,
      totalPages: 2,
      hasNext: true,
      hasPrevious: false,
    })
    const page2 = makePaginatedReviews([makeActivityReview({ id: 'r2' })], {
      page: 2,
      limit: 5,
      total: 6,
      totalPages: 2,
      hasNext: false,
      hasPrevious: true,
    })
    vi.mocked(listReviews).mockResolvedValueOnce(page1).mockResolvedValueOnce(page2)

    const { result } = renderHook(() => useActivityReviews('a1', { initialLimit: 5 }), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.items).toHaveLength(1))
    expect(listReviews).toHaveBeenCalledWith({ activityId: 'a1', page: 1, limit: 5 })
    expect(result.current.hasNext).toBe(true)

    act(() => result.current.setPage(2))

    await waitFor(() => expect(result.current.items[0]?.id).toBe('r2'))
    expect(listReviews).toHaveBeenLastCalledWith({ activityId: 'a1', page: 2, limit: 5 })
    expect(result.current.hasPrevious).toBe(true)
  })

  it('does not fetch when disabled or when activityId is empty', () => {
    renderHook(() => useActivityReviews('a1', { enabled: false }), {
      wrapper: createQueryWrapper(),
    })
    renderHook(() => useActivityReviews(''), {
      wrapper: createQueryWrapper(),
    })

    expect(listReviews).not.toHaveBeenCalled()
  })
})
