import { afterEach, describe, expect, it, vi } from 'vitest'
import { makeMember } from '../test/members'
import { makePaginationMeta } from '../test/reviews'
import { makeTrip } from '../test/trips'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

async function load(fetchMock: ReturnType<typeof vi.fn>) {
  vi.stubEnv('VITE_API_URL', 'http://api.test')
  vi.stubGlobal('fetch', fetchMock)
  return {
    ...(await import('./members')),
    ...(await import('./invites')),
    ...(await import('./users')),
  }
}

const request = (fetchMock: ReturnType<typeof vi.fn>, call = 0) =>
  fetchMock.mock.calls[call][0] as Request

const sent = (fetchMock: ReturnType<typeof vi.fn>) =>
  fetchMock.mock.calls.map(
    ([call]) =>
      `${(call as Request).method} ${new URL((call as Request).url).pathname.replace('/api', '')}`,
  )

describe('collaboration services', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('joins every page of the trip members', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ data: [makeMember()], meta: makePaginationMeta({ hasNext: true }) }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ data: [makeMember({ id: 'm2' })], meta: makePaginationMeta() }),
      )
    const { listTripMembers } = await load(fetchMock)

    await expect(listTripMembers('t1')).resolves.toHaveLength(2)
    expect(request(fetchMock, 1).url).toContain('tripId=t1&page=2&limit=100')
  })

  it('changes a permission and removes a member', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(makeMember({ permission: 'EDITOR' })))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
    const { updateMemberPermission, removeTripMember } = await load(fetchMock)

    await updateMemberPermission('m1', 'EDITOR')
    await removeTripMember('m1')

    expect(sent(fetchMock)).toEqual(['PATCH /trip-members/m1', 'DELETE /trip-members/m1'])
    await expect(request(fetchMock).json()).resolves.toEqual({ permission: 'EDITOR' })
  })

  it('reads, regenerates and uses the invite code', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ code: 'K7M2QX9P' }))
      .mockResolvedValueOnce(jsonResponse({ code: 'ABCD2345' }))
      .mockResolvedValueOnce(jsonResponse(makeTrip({ role: 'VIEWER' }), 201))
    const { getInviteCode, regenerateInviteCode, joinTrip } = await load(fetchMock)

    await expect(getInviteCode('t1')).resolves.toBe('K7M2QX9P')
    await expect(regenerateInviteCode('t1')).resolves.toBe('ABCD2345')
    await expect(joinTrip('ABCD2345')).resolves.toMatchObject({ role: 'VIEWER' })

    expect(sent(fetchMock)).toEqual([
      'GET /trips/t1/invite-code',
      'POST /trips/t1/invite-code/regenerate',
      'POST /trips/join',
    ])
    await expect(request(fetchMock, 2).json()).resolves.toEqual({ code: 'ABCD2345' })
  })

  it.each([404, 409])('throws an ApiError on a %i when joining', async (status) => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ message: 'x' }, status))
    const { joinTrip } = await load(fetchMock)

    await expect(joinTrip('K7M2QX9P')).rejects.toMatchObject({ status })
  })

  it('keeps only the name of a person, never the email', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ id: 'bia', name: 'Bia', email: 'bia@teste.dev' }))
    const { getUserName } = await load(fetchMock)

    await expect(getUserName('bia')).resolves.toBe('Bia')
    expect(request(fetchMock).url).toBe('http://api.test/api/users/bia')
  })
})
