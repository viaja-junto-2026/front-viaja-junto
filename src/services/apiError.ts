/** Um problema de validação (422) ligado a um campo do formulário. */
export type ValidationIssue = {
  /** Nome do campo como a API usa (`startDate`, `name`...). */
  field: string
  /** Mensagem em português, pronta para mostrar embaixo do campo. */
  message: string
}

/** Resposta de erro da API: `message` é um texto, ou uma lista de textos no 422. */
type ErrorBody = { message?: string | string[] }

/** Traduz a regra de validação do back-end (class-validator) para português. */
const ruleTranslations: Array<[RegExp, (match: RegExpMatchArray) => string]> = [
  [
    /must be longer than or equal to (\d+) characters?/,
    (m) => `deve ter pelo menos ${m[1]} caracteres`,
  ],
  [
    /must be shorter than or equal to (\d+) characters?/,
    (m) => `deve ter no máximo ${m[1]} caracteres`,
  ],
  [/should not be empty/, () => 'não pode ficar vazio'],
  [/must not be earlier than startDate/, () => 'não pode ser antes da data de início'],
  [/must not be earlier than arrival/, () => 'não pode ser antes da chegada'],
  [/must be within the trip dates/, () => 'precisa estar dentro das datas da viagem'],
  [/must be within the destination stay/, () => 'precisa estar dentro da estadia no destino'],
  [/must be a valid ISO4217 currency code/, () => 'escolha uma moeda válida'],
  [/must not be less than (-?[\d.]+)/, (m) => `deve ser no mínimo ${m[1]}`],
  [/must not be greater than (-?[\d.]+)/, (m) => `deve ser no máximo ${m[1]}`],
  [/must be a positive number/, () => 'deve ser um número maior que zero'],
  [/must be an? (integer|number)/, () => 'deve ser um número válido'],
  [/must be an email/, () => 'informe um e-mail válido'],
  [/must be a (Date instance|valid ISO 8601 date string)/, () => 'informe uma data válida'],
  [/must be a UUID/, () => 'valor inválido'],
  [/must be one of the following values/, () => 'escolha uma das opções'],
]

/**
 * Converte uma mensagem do back-end (`"endDate must be a Date instance"`) em um problema
 * por campo, com o texto em português. Mensagens desconhecidas viram "valor inválido".
 */
export function parseValidationMessage(raw: string): ValidationIssue {
  const [field = '', ...rest] = raw.trim().split(' ')
  const rule = rest.join(' ')
  for (const [pattern, translate] of ruleTranslations) {
    const match = rule.match(pattern)
    if (match) return { field, message: translate(match) }
  }
  return { field, message: 'valor inválido' }
}

/**
 * Erro devolvido pela API (qualquer resposta que não seja de sucesso).
 * O `message` é para quem desenvolve; para mostrar ao usuário, use `getErrorMessage`.
 */
export class ApiError extends Error {
  readonly status: number
  /** Só no 422: um item por campo inválido, pronto para o formulário. */
  readonly issues: ValidationIssue[]

  constructor(status: number, message: string, issues: ValidationIssue[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.issues = issues
  }

  /** Cria o erro a partir do status HTTP e do corpo da resposta do `apiClient`. */
  static fromResponse(status: number, body?: unknown): ApiError {
    const rawMessage = (body as ErrorBody | undefined)?.message
    if (Array.isArray(rawMessage)) {
      return new ApiError(
        status,
        `HTTP ${status}: ${rawMessage.join('; ')}`,
        rawMessage.map(parseValidationMessage),
      )
    }
    const text = typeof rawMessage === 'string' ? `HTTP ${status}: ${rawMessage}` : `HTTP ${status}`
    return new ApiError(status, text)
  }

  /** Os problemas por campo como objeto (`{ name: 'deve ter pelo menos 2 caracteres' }`). */
  get fieldErrors(): Record<string, string> {
    return Object.fromEntries(this.issues.map((issue) => [issue.field, issue.message]))
  }
}

/** Recurso inexistente (404) ou identificador inválido na URL (400). */
export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 404 || error.status === 400)
}

type ClientResult<TData> = {
  data?: TData
  error?: unknown
  response: Response
}

/**
 * Devolve os dados de uma chamada do `apiClient` ou lança um `ApiError`.
 * Use em toda função de serviço: `return unwrap(await apiClient.GET('/api/trips'))`.
 */
export function unwrap<TData>(result: ClientResult<TData>): TData {
  if (!result.response.ok) {
    throw ApiError.fromResponse(result.response.status, result.error)
  }
  return result.data as TData
}
