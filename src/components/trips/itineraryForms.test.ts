import { describe, expect, it } from 'vitest'
import { makeTripActivity } from '../../test/itinerary'
import {
  parseCost,
  timeOptions,
  toActivityInput,
  toActivityValues,
  validateActivity,
} from './activityFormValues'
import { describePeriod, toStopInput, validateStop } from './stopFormValues'

const trip = { start: '2027-01-15', end: '2027-01-28' }

describe('stop validation', () => {
  const stop = toStopInput()

  it('accepts a stop without dates', () => {
    expect(validateStop(stop, trip)).toEqual({})
  })

  it.each([
    [{ arrival: '2027-01-10' }, 'arrival', /dia da viagem, entre 15 jan. 2027 e 28 jan. 2027/],
    [{ departure: '2027-02-01' }, 'departure', /dia da viagem/],
    [{ arrival: '2027-01-20', departure: '2027-01-18' }, 'departure', /antes da chegada/],
    [{ description: 'a'.repeat(2001) }, 'description', /2000/],
  ])('rejects %j', (values, field, message) => {
    expect(validateStop({ ...stop, ...values }, trip)).toHaveProperty(
      field,
      expect.stringMatching(message),
    )
  })

  it('describes an open period', () => {
    expect(describePeriod({ start: '2027-01-15' })).toBe('a partir de 15 jan. 2027')
    expect(describePeriod({ end: '2027-01-28' })).toBe('até 28 jan. 2027')
  })
})

describe('activity form values', () => {
  const empty = toActivityValues()

  it('starts empty and pending, and sends nulls', () => {
    expect(toActivityInput(empty)).toEqual({
      dateTime: null,
      durationMinutes: null,
      expectedCost: null,
      status: 'PENDING',
    })
  })

  it('reads a saved activity back into the fields', () => {
    const values = toActivityValues(makeTripActivity({ durationMinutes: 95, expectedCost: 12.5 }))

    expect(values).toMatchObject({
      dateTime: '2027-01-16',
      time: '10:00',
      hours: '1',
      minutes: '35',
      expectedCost: '12,5',
    })
    expect(toActivityValues(makeTripActivity({ durationMinutes: null }))).toMatchObject({
      hours: '',
      minutes: '',
    })
  })

  it.each([
    ['150', 150],
    ['150,50', 150.5],
    ['1.250,00', 1250],
    ['99.9', 99.9],
    ['-3', null],
    ['10,999', null],
    ['abc', null],
  ])('reads the cost "%s"', (text, value) => {
    expect(parseCost(text)).toBe(value)
  })

  it.each([
    [{ dateTime: '2027-02-01', time: '10:00' }, 'dateTime', /dia da estadia/],
    [{ dateTime: '2027-01-16' }, 'time', /horário/],
    [{ time: '10:00' }, 'dateTime', /dia desse horário/],
    [{ hours: 'duas' }, 'durationMinutes', /só números/],
    [{ minutes: '0' }, 'durationMinutes', /1 minuto a 168 horas/],
    [{ hours: '169' }, 'durationMinutes', /168 horas/],
    [{ expectedCost: 'x' }, 'expectedCost', /valor como/],
  ])('rejects %j', (values, field, message) => {
    expect(validateActivity({ ...empty, ...values }, trip)).toHaveProperty(
      field,
      expect.stringMatching(message),
    )
  })

  it('offers half hours and keeps a saved time outside them', () => {
    expect(timeOptions('')).toHaveLength(48)
    expect(timeOptions('10:15').map((option) => option.value)).toContain('10:15')
  })
})
