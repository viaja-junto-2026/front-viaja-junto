import { describe, expect, it } from 'vitest'
import { ApiError, parseValidationMessage, unwrap } from './apiError'

describe('parseValidationMessage', () => {
  it.each([
    [
      'name must be longer than or equal to 2 characters',
      'name',
      'deve ter pelo menos 2 caracteres',
    ],
    [
      'name must be shorter than or equal to 80 characters',
      'name',
      'deve ter no máximo 80 caracteres',
    ],
    ['name should not be empty', 'name', 'não pode ficar vazio'],
    [
      'endDate must not be earlier than startDate',
      'endDate',
      'não pode ser antes da data de início',
    ],
    ['currency must be a valid ISO4217 currency code', 'currency', 'escolha uma moeda válida'],
    ['departure must not be earlier than arrival', 'departure', 'não pode ser antes da chegada'],
    [
      'arrival must be within the trip dates (2027-01-15 to 2027-01-28)',
      'arrival',
      'precisa estar dentro das datas da viagem',
    ],
    [
      'dateTime must be within the destination stay (2027-01-15 to 2027-01-19)',
      'dateTime',
      'precisa estar dentro da estadia no destino',
    ],
    ['rating must not be less than 1', 'rating', 'deve ser no mínimo 1'],
    ['rating must not be greater than 5', 'rating', 'deve ser no máximo 5'],
    ['amount must be a positive number', 'amount', 'deve ser um número maior que zero'],
    ['amount must be an integer number', 'amount', 'deve ser um número válido'],
    ['email must be an email', 'email', 'informe um e-mail válido'],
    ['endDate must be a Date instance', 'endDate', 'informe uma data válida'],
    ['startDate must be a valid ISO 8601 date string', 'startDate', 'informe uma data válida'],
    ['payerId must be a UUID', 'payerId', 'valor inválido'],
    ['status must be one of the following values: A, B', 'status', 'escolha uma das opções'],
  ])('translates "%s"', (raw, field, message) => {
    expect(parseValidationMessage(raw)).toEqual({ field, message })
  })

  it('falls back to "valor inválido" for an unknown rule', () => {
    expect(parseValidationMessage('name has a weird problem')).toEqual({
      field: 'name',
      message: 'valor inválido',
    })
  })

  it('handles an empty message', () => {
    expect(parseValidationMessage('')).toEqual({ field: '', message: 'valor inválido' })
  })
})

describe('ApiError.fromResponse', () => {
  it('keeps the status and the API message', () => {
    const error = ApiError.fromResponse(404, { statusCode: 404, message: 'Trip not found' })

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('ApiError')
    expect(error.status).toBe(404)
    expect(error.message).toBe('HTTP 404: Trip not found')
    expect(error.issues).toEqual([])
    expect(error.fieldErrors).toEqual({})
  })

  it('works without a body', () => {
    expect(ApiError.fromResponse(500).message).toBe('HTTP 500')
    expect(ApiError.fromResponse(500, {}).message).toBe('HTTP 500')
  })

  it('turns the 422 message list into one issue per field', () => {
    const error = ApiError.fromResponse(422, {
      statusCode: 422,
      message: [
        'name must be longer than or equal to 2 characters',
        'endDate must be a Date instance',
      ],
      error: 'Unprocessable Entity',
    })

    expect(error.status).toBe(422)
    expect(error.issues).toEqual([
      { field: 'name', message: 'deve ter pelo menos 2 caracteres' },
      { field: 'endDate', message: 'informe uma data válida' },
    ])
    expect(error.fieldErrors).toEqual({
      name: 'deve ter pelo menos 2 caracteres',
      endDate: 'informe uma data válida',
    })
    expect(error.message).toContain('name must be longer')
  })
})

describe('unwrap', () => {
  it('returns the data of a successful call', () => {
    const data = { id: '1' }

    expect(unwrap({ data, response: new Response(null, { status: 200 }) })).toBe(data)
  })

  it('returns undefined for a response without a body (204)', () => {
    expect(unwrap({ response: new Response(null, { status: 204 }) })).toBeUndefined()
  })

  it('throws an ApiError built from the error response', () => {
    const run = () =>
      unwrap({
        error: { message: 'Forbidden resource' },
        response: new Response(null, { status: 403 }),
      })

    expect(run).toThrow(ApiError)
    expect(run).toThrow('HTTP 403: Forbidden resource')
  })

  it('throws even when the API sends no error body', () => {
    expect(() => unwrap({ response: new Response(null, { status: 502 }) })).toThrow('HTTP 502')
  })
})
