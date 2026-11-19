import { describe, expect, it } from 'vitest'
import {
  daysUntil,
  formatCurrency,
  formatCurrencyFromCents,
  formatDate,
  formatDateRange,
  formatRating,
  nightsBetween,
} from './format'

// O Intl separa o "R$" do número com um espaço que não quebra linha (U+00A0).
const nbsp = ' '

describe('formatCurrency', () => {
  it('formats a decimal value in reais', () => {
    expect(formatCurrency(1250)).toBe(`R$${nbsp}1.250,00`)
    expect(formatCurrency(0.5)).toBe(`R$${nbsp}0,50`)
    expect(formatCurrency(1234567.89)).toBe(`R$${nbsp}1.234.567,89`)
  })

  it('formats negative values and other currencies', () => {
    expect(formatCurrency(-10)).toBe(`-R$${nbsp}10,00`)
    expect(formatCurrency(-3.5, 'USD')).toBe(`-US$${nbsp}3,50`)
  })
})

describe('formatCurrencyFromCents', () => {
  it('converts cents to reais before formatting', () => {
    expect(formatCurrencyFromCents(125000)).toBe(`R$${nbsp}1.250,00`)
    expect(formatCurrencyFromCents(5)).toBe(`R$${nbsp}0,05`)
  })

  it('uses the given currency', () => {
    expect(formatCurrencyFromCents(1999, 'USD')).toBe(`US$${nbsp}19,99`)
  })
})

describe('formatDate', () => {
  it('shows day, short month and year', () => {
    expect(formatDate('2027-03-12')).toBe('12 mar. 2027')
    expect(formatDate('2027-05-01')).toBe('1 mai. 2027')
    expect(formatDate('2027-09-30')).toBe('30 set. 2027')
  })

  it('does not shift the day with the browser time zone', () => {
    expect(formatDate('2027-01-01T00:00:00.000Z')).toBe('1 jan. 2027')
    expect(formatDate(new Date(Date.UTC(2027, 11, 31)))).toBe('31 dez. 2027')
  })

  it('returns a dash for an invalid date', () => {
    expect(formatDate('not a date')).toBe('—')
  })
})

describe('formatDateRange', () => {
  it('uses "de" and omits the first year inside the same year', () => {
    expect(formatDateRange('2027-03-12', '2027-04-02')).toBe('12 de mar. – 2 de abr. de 2027')
  })

  it('groups the days when the month is the same', () => {
    expect(formatDateRange('2027-03-12', '2027-03-20')).toBe('12 – 20 de mar. de 2027')
  })

  it('shows both years when they differ', () => {
    expect(formatDateRange('2027-12-20', '2028-01-05')).toBe(
      '20 de dez. de 2027 – 5 de jan. de 2028',
    )
  })

  it('returns a dash when a date is invalid', () => {
    expect(formatDateRange('2027-03-12', 'x')).toBe('—')
    expect(formatDateRange('x', '2027-03-12')).toBe('—')
  })
})

describe('nightsBetween', () => {
  it('counts the nights between two days', () => {
    expect(nightsBetween('2027-03-01', '2027-03-05')).toBe(4)
    expect(nightsBetween('2027-03-01', '2027-03-02')).toBe(1)
  })

  it('crosses months and years', () => {
    expect(nightsBetween('2027-12-30', '2028-01-02')).toBe(3)
  })

  it('is zero for the same day, a reversed range or an invalid date', () => {
    expect(nightsBetween('2027-03-01', '2027-03-01')).toBe(0)
    expect(nightsBetween('2027-03-05', '2027-03-01')).toBe(0)
    expect(nightsBetween('x', '2027-03-01')).toBe(0)
    expect(nightsBetween('2027-03-01', 'x')).toBe(0)
  })

  it('ignores the time of day', () => {
    expect(nightsBetween('2027-03-01T22:00:00.000Z', '2027-03-03T01:00:00.000Z')).toBe(2)
  })
})

describe('daysUntil', () => {
  const now = new Date(2027, 2, 10, 15, 30) // 10 de março de 2027, à tarde, no horário local

  it('counts the days until a future date', () => {
    expect(daysUntil('2027-03-11', now)).toBe(1)
    expect(daysUntil('2027-04-09', now)).toBe(30)
  })

  it('is zero today and negative in the past', () => {
    expect(daysUntil('2027-03-10', now)).toBe(0)
    expect(daysUntil('2027-03-07', now)).toBe(-3)
  })

  it('returns zero for an invalid date and uses the current date by default', () => {
    expect(daysUntil('x', now)).toBe(0)
    expect(daysUntil(new Date(Date.now() + 5 * 86_400_000).toISOString())).toBeGreaterThanOrEqual(4)
  })
})

describe('formatRating', () => {
  it('shows one decimal digit with a comma', () => {
    expect(formatRating(4.8)).toBe('4,8')
    expect(formatRating(5)).toBe('5,0')
    expect(formatRating(3.14159)).toBe('3,1')
  })
})
