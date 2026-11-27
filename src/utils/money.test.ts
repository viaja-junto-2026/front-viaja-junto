import { describe, expect, it } from 'vitest'
import { formatPercent } from './format'
import { amountToText, parseAmount } from './money'

describe('parseAmount', () => {
  it.each([
    ['150', 150],
    [' 150,50 ', 150.5],
    ['150,5', 150.5],
    ['99.9', 99.9],
    ['1250.50', 1250.5],
    ['17.000', 17000],
    ['1.250', 1250],
    ['1.250,00', 1250],
    ['1.000.000,99', 1000000.99],
    ['0', 0],
  ])('reads "%s"', (text, value) => {
    expect(parseAmount(text)).toBe(value)
  })

  it.each(['', '-3', '10,999', '1.25,0', '1,250.00', '17.00.0', '1e9', 'abc', 'R$ 10'])(
    'rejects "%s"',
    (text) => {
      expect(parseAmount(text)).toBeNull()
    },
  )
})

describe('amountToText', () => {
  it('writes a saved amount back with a comma, and nothing for a missing one', () => {
    expect(amountToText(1250.5)).toBe('1250,5')
    expect(amountToText(0)).toBe('0')
    expect(amountToText(null)).toBe('')
    expect(amountToText(undefined)).toBe('')
  })
})

describe('formatPercent', () => {
  it('keeps the number and the sign together', () => {
    expect(formatPercent(62)).toBe('62\u00a0%')
    expect(formatPercent(1250)).toBe('1.250\u00a0%')
  })
})
