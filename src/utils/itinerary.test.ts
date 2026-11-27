import { describe, expect, it } from 'vitest'
import { makeStop, makeTripActivity } from '../test/itinerary'
import { formatDayTitle, formatDuration, formatTime } from './format'
import { groupByDay, sortStops } from './itinerary'

describe('sortStops', () => {
  it('follows the visit order and leaves stops without order last, by arrival', () => {
    const stops = [
      makeStop({ id: 'late', order: null, arrival: null }),
      makeStop({ id: 'second', order: 1 }),
      makeStop({ id: 'soon', order: null, arrival: '2027-01-01T00:00:00.000Z' }),
      makeStop({ id: 'first', order: 0 }),
    ]

    expect(sortStops(stops).map((stop) => stop.id)).toEqual(['first', 'second', 'soon', 'late'])
  })
})

describe('groupByDay', () => {
  it('groups by day in chronological order, with undated ones at the end', () => {
    const days = groupByDay([
      makeTripActivity({ id: 'none', dateTime: null }),
      makeTripActivity({ id: 'night', dateTime: '2027-01-16T21:00:00.000Z' }),
      makeTripActivity({ id: 'before', dateTime: '2027-01-15T14:00:00.000Z' }),
      makeTripActivity({ id: 'morning', dateTime: '2027-01-16T10:00:00.000Z' }),
    ])

    expect(days.map(({ day, activities }) => [day, activities.map((a) => a.id)])).toEqual([
      ['2027-01-15', ['before']],
      ['2027-01-16', ['morning', 'night']],
      [null, ['none']],
    ])
  })
})

describe('itinerary formats', () => {
  it.each([
    [0, '0 min'],
    [45, '45 min'],
    [180, '3 h'],
    [90, '1 h 30 min'],
    [1440, '1 dia'],
    [5760, '4 dias'],
    [1560, '1 dia e 2 h'],
  ])('writes %i minutes as "%s"', (minutes, text) => {
    expect(formatDuration(minutes)).toBe(text)
  })

  it('keeps the stored hour and writes the day in full', () => {
    expect(formatTime('2027-01-15T14:00:00.000Z')).toBe('14:00')
    expect(formatDayTitle('2027-01-15')).toBe('Sexta-feira, 15 de janeiro')
    expect(formatTime('x')).toBe('—')
    expect(formatDayTitle('x')).toBe('—')
  })
})
