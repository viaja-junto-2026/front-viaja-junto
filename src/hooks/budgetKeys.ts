/**
 * Chave do resumo no cache. Fica à parte porque o roteiro e a viagem também mudam o
 * resumo (o custo das atividades e a moeda) e precisam pedir que ele seja buscado de novo.
 */
export const budgetSummaryKey = (userId: string | undefined, tripId: string) =>
  ['budget-summary', userId, tripId] as const
