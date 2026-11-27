import { ApiError } from '../services/apiError'

/** Nomes dos campos em português, para a mensagem do 422 ("Confira: nome, data de início"). */
const fieldLabels: Record<string, string> = {
  name: 'nome',
  description: 'descrição',
  startDate: 'data de início',
  arrival: 'chegada',
  departure: 'saída',
  endDate: 'data de término',
  email: 'e-mail',
  code: 'código',
  amount: 'valor',
  currency: 'moeda',
  rating: 'nota',
  comment: 'comentário',
  expectedCost: 'custo esperado',
  durationMinutes: 'duração',
  dateTime: 'data e hora',
  status: 'status',
  type: 'tipo',
  category: 'categoria',
  permission: 'permissão',
  spentOn: 'data da despesa',
  payerId: 'quem pagou',
  order: 'ordem',
}

const NETWORK_MESSAGE = 'Sem conexão com o servidor. Verifique sua internet e tente de novo.'
const GENERIC_MESSAGE = 'Algo deu errado. Tente de novo.'

/** Nomes legíveis dos campos com problema, sem repetir. */
function describeFields(error: ApiError): string {
  const labels = error.issues
    .map((issue) => fieldLabels[issue.field] ?? issue.field)
    .filter(Boolean)
  return [...new Set(labels)].join(', ')
}

/**
 * Mensagem em português para mostrar ao usuário, a partir de qualquer erro:
 * 401, 403, 404, 409, 422 (com os campos), 429, erro do servidor e falha de rede.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        return 'Sua sessão expirou. Entre de novo para continuar.'
      case 403:
        return 'Você não tem permissão para fazer isso.'
      case 404:
        return 'Não encontramos o que você procurou.'
      case 409:
        return 'Isso entra em conflito com algo que já existe. Confira e tente de novo.'
      case 422: {
        const fields = describeFields(error)
        return fields
          ? `Confira os campos e tente de novo: ${fields}.`
          : 'Confira os campos e tente de novo.'
      }
      case 429:
        return 'Muitas tentativas seguidas. Aguarde um instante e tente de novo.'
      default:
        return error.status >= 500
          ? 'O servidor está com problemas. Tente de novo em instantes.'
          : GENERIC_MESSAGE
    }
  }
  // O `fetch` lança TypeError quando não consegue falar com o servidor (sem internet, servidor fora).
  if (error instanceof TypeError) return NETWORK_MESSAGE
  return GENERIC_MESSAGE
}
