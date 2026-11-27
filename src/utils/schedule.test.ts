import { describe, expect, it } from 'vitest'
import type { PlannedActivity, RouteStop } from '../hooks/useTripRoute'
import { makeActivity } from '../test/activities'
import { makeDestination } from '../test/destinations'
import { makeStop, makeTripActivity } from '../test/itinerary'
import {
  activityNotices,
  reviewActivity,
  reviewStop,
  stopNotices,
  stopsOutsideTrip,
} from './schedule'

const planned = (
  overrides: Partial<PlannedActivity> = {},
  name = 'Louvre',
  type: 'TOUR' | 'LODGING' = 'TOUR',
): PlannedActivity => ({
  ...makeTripActivity(),
  catalog: makeActivity({ name, type }),
  ...overrides,
})

const stop = (overrides: Partial<RouteStop> = {}, name = 'Paris'): RouteStop => ({
  ...makeStop(),
  catalog: makeDestination({ name }),
  activities: [],
  ...overrides,
})

// Louvre em 16/01, das 10:00 às 13:00, em uma estadia de 15/01 a 19/01.
const louvre = planned()
const paris = stop({ activities: [louvre] })

const candidate = (
  dateTime: string | null,
  { catalogId = 'orsay', durationMinutes = 60 as number | null, isLodging = false } = {},
) => ({ catalogId, dateTime, durationMinutes, isLodging })

describe('reviewActivity', () => {
  it('blocks the same place on the same day and time, in any stop', () => {
    const other = stop({ id: 's2' })
    const review = reviewActivity(
      [paris, other],
      other,
      candidate('2027-01-16T10:00:00.000Z', { catalogId: 'louvre' }),
    )

    expect(review.blocker).toBe(
      'Louvre já está no roteiro nesse dia e horário. Escolha outro horário.',
    )
    expect(review.warnings).toEqual([])
  })

  it('allows the same place at another time or day', () => {
    for (const dateTime of ['2027-01-16T15:00:00.000Z', '2027-01-17T10:00:00.000Z']) {
      const review = reviewActivity([paris], paris, candidate(dateTime, { catalogId: 'louvre' }))
      expect(review).toEqual({ blocker: undefined, warnings: [] })
    }
  })

  it('only warns when another place overlaps', () => {
    const review = reviewActivity([paris], paris, candidate('2027-01-16T12:00:00.000Z'))

    expect(review.blocker).toBeUndefined()
    expect(review.warnings).toEqual(['Nesse horário já há: Louvre (10:00).'])
  })

  it('does not treat back-to-back activities as a clash', () => {
    for (const dateTime of ['2027-01-16T09:00:00.000Z', '2027-01-16T13:00:00.000Z']) {
      expect(reviewActivity([paris], paris, candidate(dateTime)).warnings).toEqual([])
    }
  })

  it('compares activities without duration by their start time', () => {
    const instant = stop({ activities: [planned({ durationMinutes: null })] })
    const at = (dateTime: string) =>
      reviewActivity([instant], instant, candidate(dateTime, { durationMinutes: null })).warnings

    expect(at('2027-01-16T10:00:00.000Z')).toHaveLength(1)
    expect(at('2027-01-16T10:30:00.000Z')).toEqual([])
  })

  it('leaves lodging out of time clashes, on both sides', () => {
    const hotel = planned({ id: 'h', durationMinutes: 5760 }, 'Hotel', 'LODGING')
    const withHotel = stop({ activities: [hotel] })
    const tour = candidate('2027-01-16T12:00:00.000Z')

    expect(reviewActivity([withHotel], withHotel, tour).warnings).toEqual([])
    expect(reviewActivity([paris], paris, { ...tour, isLodging: true }).warnings).toEqual([])
  })

  it('warns when the activity ends after the departure day', () => {
    const late = (durationMinutes: number) =>
      reviewActivity([paris], paris, candidate('2027-01-19T22:00:00.000Z', { durationMinutes }))
        .warnings

    expect(late(120)).toEqual([])
    expect(late(121)).toEqual(['Pela duração, ela termina depois da saída, em 19 jan. 2027.'])
  })

  it('survives an absurd duration while the person is typing', () => {
    const review = reviewActivity(
      [paris],
      paris,
      candidate('2027-01-17T10:00:00.000Z', { durationMinutes: 1e15 }),
    )

    expect(review.warnings).toHaveLength(1)
  })

  it('has nothing to check without a day and time', () => {
    expect(reviewActivity([paris], paris, candidate(null, { catalogId: 'louvre' }))).toEqual({
      blocker: undefined,
      warnings: [],
    })
  })

  it('lets an existing repeat be edited, but not a new one be created', () => {
    const twin = planned({ id: 'a2' })
    const evening = planned({ id: 'a3', dateTime: '2027-01-16T18:00:00.000Z' })
    const doubled = stop({ activities: [louvre, twin, evening] })
    const same = candidate(louvre.dateTime, { catalogId: 'louvre' })

    expect(reviewActivity([doubled], doubled, same, twin).blocker).toBeUndefined()
    expect(reviewActivity([doubled], doubled, same, evening).blocker).toContain('já está')
  })
})

describe('reviewStop', () => {
  const dates = (arrival: string | null, departure: string | null, catalogId = 'roma') => ({
    catalogId,
    arrival,
    departure,
  })

  it('accepts leaving one city and arriving in another on the same day', () => {
    expect(reviewStop([paris], dates('2027-01-19', '2027-01-22'))).toEqual({ warnings: [] })
  })

  it('warns when the stays cross', () => {
    expect(reviewStop([paris], dates('2027-01-18', '2027-01-22')).warnings).toEqual([
      'Essas datas se cruzam com as de: Paris.',
    ])
  })

  it('blocks the same destination with the same dates', () => {
    const review = reviewStop([paris], dates('2027-01-15', '2027-01-19', 'paris'))

    expect(review.blocker).toContain('com as mesmas datas')
  })

  it('allows going back to a destination in another period', () => {
    expect(reviewStop([paris], dates('2027-01-22', '2027-01-25', 'paris'))).toEqual({
      warnings: [],
    })
  })

  it('blocks new dates that would leave an activity outside', () => {
    const review = reviewStop([paris], dates('2027-01-17', '2027-01-19', 'paris'), paris)

    expect(review.blocker).toBe(
      'Com essas datas, ficariam fora do período: Louvre. Antes, mude o dia dessas atividades ou exclua-as.',
    )
  })

  it('does not block other edits of a stop that already has an activity outside', () => {
    const broken = stop({ departure: '2027-01-15T00:00:00.000Z', activities: [louvre] })

    expect(
      reviewStop([broken], dates('2027-01-15', '2027-01-15', 'paris'), broken).blocker,
    ).toBeUndefined()
  })
})

describe('what is already inconsistent', () => {
  const trip = { startDate: '2027-01-15T00:00:00.000Z', endDate: '2027-01-28T00:00:00.000Z' }

  it('finds the stops outside the trip dates', () => {
    expect(stopsOutsideTrip([paris], '2027-01-16', null)).toEqual([paris])
    expect(stopsOutsideTrip([paris], null, '2027-01-18')).toEqual([paris])
    expect(stopsOutsideTrip([paris], trip.startDate, trip.endDate)).toEqual([])
  })

  it('marks stops outside the trip or out of date order', () => {
    const earlier = stop({
      id: 's2',
      arrival: '2027-01-10T00:00:00.000Z',
      departure: '2027-01-12T00:00:00.000Z',
    })
    const notices = stopNotices([paris, earlier], trip)

    expect(notices.get('s1')).toEqual([])
    expect(notices.get('s2')).toHaveLength(2)
  })

  it('marks repeated activities and the ones outside the stay', () => {
    const twin = planned({ id: 'a2' })
    const outside = planned({ id: 'a3', dateTime: '2027-01-25T10:00:00.000Z' })
    const notices = activityNotices([stop({ activities: [louvre, twin, outside] })])

    expect(Object.fromEntries(notices)).toEqual({
      a1: 'Repetida',
      a2: 'Repetida',
      a3: 'Fora das datas',
    })
  })
})
