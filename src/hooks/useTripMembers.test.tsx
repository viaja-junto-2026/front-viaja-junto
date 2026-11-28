import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../auth/authContext'
import { listTripMembers } from '../services/members'
import { getUserName } from '../services/users'
import { makeAuthValue } from '../test/auth'
import { makeMember } from '../test/members'
import { createQueryWrapper } from '../test/query'
import { makeTrip } from '../test/trips'
import { UNKNOWN_NAME, useTripMembers } from './useTripMembers'

vi.mock('../services/members', () => ({ listTripMembers: vi.fn() }))
vi.mock('../services/users', () => ({ getUserName: vi.fn() }))

function renderMembers() {
  const QueryWrapper = createQueryWrapper()
  const trip = makeTrip({ id: 't1', createdBy: 'ana' })
  return renderHook(() => useTripMembers(trip), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryWrapper>
        <AuthContext.Provider value={makeAuthValue()}>{children}</AuthContext.Provider>
      </QueryWrapper>
    ),
  })
}

describe('useTripMembers', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(listTripMembers).mockResolvedValue([
      makeMember({ id: 'm2', userId: 'caio', joinedAt: '2026-11-02T10:00:00.000Z' }),
      makeMember({ id: 'm1', userId: 'bia', permission: 'EDITOR' }),
    ])
    vi.mocked(getUserName).mockImplementation(async (id) => id.toUpperCase())
  })

  it('puts the creator first, then the members by the day they joined, with names', async () => {
    const { result } = renderMembers()

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.people.map((p) => [p.name, p.role, p.memberId])).toEqual([
      ['ANA', 'OWNER', undefined],
      ['BIA', 'EDITOR', 'm1'],
      ['CAIO', 'VIEWER', 'm2'],
    ])
    expect(listTripMembers).toHaveBeenCalledWith('t1')
  })

  it('keeps the list when a name cannot be loaded', async () => {
    vi.mocked(getUserName).mockRejectedValue(new Error('x'))
    const { result } = renderMembers()

    await waitFor(() => expect(result.current.people).toHaveLength(3))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.people[1].name).toBe(UNKNOWN_NAME)
  })

  it('has nobody and asks for no name when the list fails', async () => {
    vi.mocked(listTripMembers).mockRejectedValue(new Error('x'))
    const { result } = renderMembers()

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.people).toEqual([])
    expect(getUserName).not.toHaveBeenCalled()
  })
})
