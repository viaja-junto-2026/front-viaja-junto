import { describe, expect, it } from 'vitest'
import { paths } from './paths'

describe('paths', () => {
  it('builds the paths that have parameters', () => {
    expect(paths.destinationDetails('abc')).toBe('/destinations/abc')
    expect(paths.activityDetails('abc')).toBe('/activities/abc')
    expect(paths.tripDetails('42')).toBe('/trips/42')
    expect(paths.tripEdit('42')).toBe('/trips/42/edit')
  })
})
