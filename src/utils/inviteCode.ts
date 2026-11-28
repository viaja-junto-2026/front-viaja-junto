/** Regras do código de convite, iguais às do back-end. */

export const INVITE_CODE_LENGTH = 8

/** Sem I, L, O, 0 e 1, que se confundem quando o código é copiado à mão. */
const PATTERN = new RegExp(`^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{${INVITE_CODE_LENGTH}}$`)

/**
 * Deixa o código no formato que a API aceita. Ela recusa espaços e letras minúsculas,
 * que são comuns quando o código é colado de uma mensagem.
 */
export function normalizeInviteCode(text: string): string {
  return text.replace(/[\s-]/g, '').toUpperCase()
}

/** O que há de errado com um código já normalizado, ou `undefined` se dá para enviar. */
export function validateInviteCode(code: string): string | undefined {
  if (!code) return 'Informe o código de convite.'
  if (code.length !== INVITE_CODE_LENGTH) {
    return `O código tem ${INVITE_CODE_LENGTH} letras e números.`
  }
  if (!PATTERN.test(code)) {
    return 'Confira o código: ele não usa as letras I, L e O nem os números 0 e 1.'
  }
  return undefined
}
