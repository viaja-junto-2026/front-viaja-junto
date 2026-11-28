import type { TripMember } from '../services/members'

/** Membro de uma viagem para os testes. */
export function makeMember(overrides: Partial<TripMember> = {}): TripMember {
  return {
    id: 'm1',
    tripId: 't1',
    userId: 'bia',
    permission: 'VIEWER',
    joinedAt: '2026-10-20T12:00:00.000Z',
    ...overrides,
  }
}
