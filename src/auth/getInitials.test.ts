import { describe, expect, it } from 'vitest'
import { getInitials } from './getInitials'

describe('getInitials', () => {
  it('uses the first and the last name', () => {
    expect(getInitials('Gustavo Fidelis')).toBe('GF')
    expect(getInitials('maria da silva souza')).toBe('MS')
  })

  it('uses a single letter for a single name', () => {
    expect(getInitials('Bernardo')).toBe('B')
  })

  it('ignores extra spaces', () => {
    expect(getInitials('  Ana   Paula  ')).toBe('AP')
  })

  it('returns a placeholder for an empty name', () => {
    expect(getInitials('   ')).toBe('?')
  })
})
