import { useQuery } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createQueryClient } from '../services/queryClient'
import { createQueryWrapper, createTestQueryClient } from '../test/query'
import type { Paginated } from '../types/pagination'
import { useApiMutation } from './useApiMutation'
import { usePaginatedQuery } from './usePaginatedQuery'

type Trip = { id: string }

function makePage(page: number, limit: number, total: number, items: Trip[]): Paginated<Trip> {
  const totalPages = Math.ceil(total / limit)
  return {
    data: items,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    },
  }
}

describe('createQueryClient', () => {
  it('uses the app defaults', () => {
    const options = createQueryClient().getDefaultOptions().queries

    expect(options?.staleTime).toBe(30_000)
    expect(options?.retry).toBe(1)
    expect(options?.refetchOnWindowFocus).toBe(false)
  })
})

describe('useQuery with the test wrapper (loading, success, error and refetch)', () => {
  it('goes from loading to success', async () => {
    const queryFn = vi.fn().mockResolvedValue('ok')

    const { result } = renderHook(() => useQuery({ queryKey: ['x'], queryFn }), {
      wrapper: createQueryWrapper(),
    })
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.data).toBe('ok'))
  })

  it('reports an error and recovers on refetch', async () => {
    const queryFn = vi.fn().mockRejectedValueOnce(new Error('falhou')).mockResolvedValue('ok')

    const { result } = renderHook(() => useQuery({ queryKey: ['x'], queryFn }), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isError).toBe(true))

    await act(async () => {
      await result.current.refetch()
    })

    await waitFor(() => expect(result.current.data).toBe('ok'))
    expect(result.current.isError).toBe(false)
    expect(queryFn).toHaveBeenCalledTimes(2)
  })
})

describe('usePaginatedQuery', () => {
  it('loads the first page with the default limit and exposes data and meta', async () => {
    const queryFn = vi.fn().mockResolvedValue(makePage(1, 10, 25, [{ id: 'a' }, { id: 'b' }]))

    const { result } = renderHook(() => usePaginatedQuery<Trip>({ queryKey: ['trips'], queryFn }), {
      wrapper: createQueryWrapper(),
    })
    expect(result.current.isLoading).toBe(true)
    expect(result.current.items).toEqual([])

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(queryFn).toHaveBeenCalledWith({ page: 1, limit: 10 })
    expect(result.current.items).toEqual([{ id: 'a' }, { id: 'b' }])
    expect(result.current.meta?.total).toBe(25)
    expect(result.current.hasNext).toBe(true)
    expect(result.current.hasPrevious).toBe(false)
    expect(result.current.isEmpty).toBe(false)
  })

  it('changes the page', async () => {
    const queryFn = vi.fn(({ page }: { page: number }) =>
      Promise.resolve(makePage(page, 10, 25, [{ id: `p${page}` }])),
    )
    const { result } = renderHook(() => usePaginatedQuery<Trip>({ queryKey: ['trips'], queryFn }), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.items).toEqual([{ id: 'p1' }]))

    act(() => result.current.setPage(2))

    await waitFor(() => expect(result.current.items).toEqual([{ id: 'p2' }]))
    expect(result.current.page).toBe(2)
    expect(result.current.hasPrevious).toBe(true)
    expect(queryFn).toHaveBeenLastCalledWith({ page: 2, limit: 10 })
  })

  it('applies filters and goes back to the first page', async () => {
    const queryFn = vi.fn().mockResolvedValue(makePage(1, 5, 1, [{ id: 'a' }]))
    const { result } = renderHook(
      () =>
        usePaginatedQuery<Trip, { status?: string; search?: string }>({
          queryKey: ['trips'],
          queryFn,
          initialFilters: { status: 'PLANNING' },
          initialPage: 3,
          initialLimit: 5,
        }),
      { wrapper: createQueryWrapper() },
    )
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(queryFn).toHaveBeenCalledWith({ page: 3, limit: 5, status: 'PLANNING' })

    act(() => result.current.setFilters({ search: 'sul' }))

    await waitFor(() =>
      expect(queryFn).toHaveBeenLastCalledWith({
        page: 1,
        limit: 5,
        status: 'PLANNING',
        search: 'sul',
      }),
    )
    expect(result.current.page).toBe(1)
    expect(result.current.filters).toEqual({ status: 'PLANNING', search: 'sul' })
  })

  it('changes the page size and goes back to the first page', async () => {
    const queryFn = vi.fn().mockResolvedValue(makePage(1, 20, 1, [{ id: 'a' }]))
    const { result } = renderHook(
      () => usePaginatedQuery<Trip>({ queryKey: ['trips'], queryFn, initialPage: 2 }),
      { wrapper: createQueryWrapper() },
    )
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setLimit(20))

    await waitFor(() => expect(queryFn).toHaveBeenLastCalledWith({ page: 1, limit: 20 }))
    expect(result.current.limit).toBe(20)
    expect(result.current.page).toBe(1)
  })

  it('reports empty when the API returns no items', async () => {
    const queryFn = vi.fn().mockResolvedValue(makePage(1, 10, 0, []))
    const { result } = renderHook(() => usePaginatedQuery<Trip>({ queryKey: ['trips'], queryFn }), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isEmpty).toBe(true))
    expect(result.current.isError).toBe(false)
  })

  it('reports the error and refetches', async () => {
    const queryFn = vi
      .fn()
      .mockRejectedValueOnce(new Error('falhou'))
      .mockResolvedValue(makePage(1, 10, 1, [{ id: 'a' }]))
    const { result } = renderHook(() => usePaginatedQuery<Trip>({ queryKey: ['trips'], queryFn }), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe('falhou')
    expect(result.current.isEmpty).toBe(false)

    await act(async () => {
      await result.current.refetch()
    })
    await waitFor(() => expect(result.current.items).toEqual([{ id: 'a' }]))
    expect(result.current.isError).toBe(false)
    expect(result.current.items).toEqual([{ id: 'a' }])
  })

  it('does not fetch while disabled', () => {
    const queryFn = vi.fn()

    renderHook(() => usePaginatedQuery<Trip>({ queryKey: ['trips'], queryFn, enabled: false }), {
      wrapper: createQueryWrapper(),
    })

    expect(queryFn).not.toHaveBeenCalled()
  })
})

describe('useApiMutation', () => {
  it('runs the mutation, invalidates the listed queries and calls onSuccess', async () => {
    const client = createTestQueryClient()
    const invalidate = vi.spyOn(client, 'invalidateQueries')
    const onSuccess = vi.fn()
    const mutationFn = vi.fn().mockResolvedValue({ id: 'new' })

    const { result } = renderHook(
      () =>
        useApiMutation<{ id: string }, { name: string }>({
          mutationFn,
          invalidateKeys: [['trips'], ['notifications']],
          onSuccess,
        }),
      { wrapper: createQueryWrapper(client) },
    )

    await act(async () => {
      await result.current.mutateAsync({ name: 'Floripa' })
    })

    expect(mutationFn).toHaveBeenCalledWith({ name: 'Floripa' }, expect.anything())
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['trips'] })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['notifications'] })
    expect(onSuccess).toHaveBeenCalledWith({ id: 'new' }, { name: 'Floripa' })
  })

  it('works without options and exposes the error without invalidating', async () => {
    const client = createTestQueryClient()
    const invalidate = vi.spyOn(client, 'invalidateQueries')
    const mutationFn = vi.fn().mockRejectedValue(new Error('falhou'))

    const { result } = renderHook(
      () => useApiMutation({ mutationFn, invalidateKeys: [['trips']] }),
      {
        wrapper: createQueryWrapper(client),
      },
    )

    act(() => result.current.mutate())

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe('falhou')
    expect(invalidate).not.toHaveBeenCalled()
  })

  it('succeeds without invalidateKeys or onSuccess', async () => {
    const mutationFn = vi.fn().mockResolvedValue('ok')
    const { result } = renderHook(() => useApiMutation({ mutationFn }), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync()
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
