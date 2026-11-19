import { describe, expect, it } from 'vitest'
import { ApiError } from '../services/apiError'
import { getErrorMessage } from './errorMessages'

describe('getErrorMessage', () => {
  it.each([
    [401, 'Sua sessão expirou. Entre de novo para continuar.'],
    [403, 'Você não tem permissão para fazer isso.'],
    [404, 'Não encontramos o que você procurou.'],
    [409, 'Isso entra em conflito com algo que já existe. Confira e tente de novo.'],
    [429, 'Muitas tentativas seguidas. Aguarde um instante e tente de novo.'],
    [500, 'O servidor está com problemas. Tente de novo em instantes.'],
    [503, 'O servidor está com problemas. Tente de novo em instantes.'],
    [400, 'Algo deu errado. Tente de novo.'],
  ])('translates the status %i', (status, message) => {
    expect(getErrorMessage(ApiError.fromResponse(status))).toBe(message)
  })

  it('lists the invalid fields on a 422, in Portuguese and without repeats', () => {
    const error = ApiError.fromResponse(422, {
      message: [
        'name must be longer than or equal to 2 characters',
        'name should not be empty',
        'endDate must be a Date instance',
        'mystery must be weird',
      ],
    })

    expect(getErrorMessage(error)).toBe(
      'Confira os campos e tente de novo: nome, data de término, mystery.',
    )
  })

  it('has a generic 422 message when there are no fields', () => {
    expect(getErrorMessage(ApiError.fromResponse(422))).toBe('Confira os campos e tente de novo.')
    expect(getErrorMessage(ApiError.fromResponse(422, { message: [' '] }))).toBe(
      'Confira os campos e tente de novo.',
    )
  })

  it('explains a network failure (fetch throws a TypeError)', () => {
    expect(getErrorMessage(new TypeError('Failed to fetch'))).toBe(
      'Sem conexão com o servidor. Verifique sua internet e tente de novo.',
    )
  })

  it('uses a generic message for anything else', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('Algo deu errado. Tente de novo.')
    expect(getErrorMessage('x')).toBe('Algo deu errado. Tente de novo.')
    expect(getErrorMessage(undefined)).toBe('Algo deu errado. Tente de novo.')
  })
})
