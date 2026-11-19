import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listTopDestinations } from '../services/destinations'
import { makeDestination } from '../test/destinations'
import { createQueryWrapper } from '../test/query'
import { useTopDestinations } from './useTopDestinations'

vi.mock('../services/destinations', () => ({ listTopDestinations: vi.fn() }))

describe('useTopDestinations', () => {
  beforeEach(() => {
    vi.mocked(listTopDestinations).mockReset()
  })

  it('loads the top destinations with the default limit', async () => {
    const destinations = [makeDestination()]
    vi.mocked(listTopDestinations).mockResolvedValue(destinations)

    const { result } = renderHook(() => useTopDestinations(), { wrapper: createQueryWrapper() })
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.data).toEqual(destinations))
    expect(listTopDestinations).toHaveBeenCalledWith({ limit: 10 })
  })

  it('uses the limit received', async () => {
    vi.mocked(listTopDestinations).mockResolvedValue([])

    const { result } = renderHook(() => useTopDestinations(3), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(listTopDestinations).toHaveBeenCalledWith({ limit: 3 })
  })

  it('exposes the error', async () => {
    vi.mocked(listTopDestinations).mockRejectedValue(new Error('falhou'))

    const { result } = renderHook(() => useTopDestinations(), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe('falhou')
  })
})
