import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getDestinationDetails } from '../services/destinations'
import { makeDestinationDetails } from '../test/destinations'
import { createQueryWrapper } from '../test/query'
import { useDestinationDetails } from './useDestinationDetails'

vi.mock('../services/destinations', () => ({ getDestinationDetails: vi.fn() }))

describe('useDestinationDetails', () => {
  beforeEach(() => {
    vi.mocked(getDestinationDetails).mockReset()
  })

  it('loads destination details for the given id', async () => {
    const destination = makeDestinationDetails({ id: 'd1' })
    vi.mocked(getDestinationDetails).mockResolvedValue(destination)

    const { result } = renderHook(() => useDestinationDetails('d1'), {
      wrapper: createQueryWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.data).toEqual(destination))
    expect(getDestinationDetails).toHaveBeenCalledWith('d1')
  })

  it('does not fetch when id is empty', () => {
    const { result } = renderHook(() => useDestinationDetails(''), {
      wrapper: createQueryWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(getDestinationDetails).not.toHaveBeenCalled()
  })

  it('exposes the error when the request fails', async () => {
    vi.mocked(getDestinationDetails).mockRejectedValue(new Error('request failed'))

    const { result } = renderHook(() => useDestinationDetails('d1'), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe('request failed')
  })
})
