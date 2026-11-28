import { describe, expect, it } from 'vitest'
import { normalizeInviteCode, validateInviteCode } from './inviteCode'

describe('normalizeInviteCode', () => {
  it.each([
    ['  k7m2qx9p ', 'K7M2QX9P'],
    ['K7M2 QX9P', 'K7M2QX9P'],
    ['k7m2-qx9p\n', 'K7M2QX9P'],
  ])('turns "%s" into what the API accepts', (text, code) => {
    expect(normalizeInviteCode(text)).toBe(code)
  })
})

describe('validateInviteCode', () => {
  it('accepts a code with eight allowed characters', () => {
    expect(validateInviteCode('K7M2QX9P')).toBeUndefined()
  })

  it.each([
    ['', /Informe o código/],
    ['K7M2', /tem 8 letras e números/],
    ['K7M2QX9PA', /tem 8 letras e números/],
    ['K7M2QX9O', /não usa as letras I, L e O/],
    ['K7M2QX90', /nem os números 0 e 1/],
    ['K7M2QX9!', /Confira o código/],
  ])('explains what is wrong with "%s"', (code, message) => {
    expect(validateInviteCode(code)).toMatch(message)
  })
})
