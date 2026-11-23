import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getActivityDetails } from '../services/activities'
import { makeActivityDetails } from '../test/activities'
import { createQueryWrapper } from '../test/query'
import { useActivityDetails } from './useActivityDetails'

vi.mock('../services/activities', () => ({ getActivityDetails: vi.fn() }))

describe('useActivityDetails', () => {
  beforeEach(() => {
    vi.mocked(getActivityDetails).mockReset()
  })

  it('loads activity details for the given id', async () => {
    const activity = makeActivityDetails({ id: 'a1' })
    vi.mocked(getActivityDetails).mockResolvedValue(activity)

    const { result } = renderHook(() => useActivityDetails('a1'), {
      wrapper: createQueryWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.data).toEqual(activity))
    expect(getActivityDetails).toHaveBeenCalledWith('a1')
  })

  it('does not fetch when id is empty', () => {
    const { result } = renderHook(() => useActivityDetails(''), {
      wrapper: createQueryWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(getActivityDetails).not.toHaveBeenCalled()
  })

  it('exposes the error when the request fails', async () => {
    vi.mocked(getActivityDetails).mockRejectedValue(new Error('request failed'))

    const { result } = renderHook(() => useActivityDetails('a1'), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe('request failed')
  })
})
