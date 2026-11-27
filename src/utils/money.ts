/** Valores em dinheiro digitados nos formulários, no jeito brasileiro de escrever. */

/** `17.000`, `1.250,50` ou `150,5`: ponto separa o milhar e vírgula, os centavos. */
const BRAZILIAN = /^(\d{1,3}(\.\d{3})+|\d+)(,\d{1,2})?$/
/** `1250.5`: ponto como decimal, com até duas casas. */
const DOT_DECIMAL = /^\d+\.\d{1,2}$/

/** O texto vira número; `null` se não for um valor válido. */
export function parseAmount(text: string): number | null {
  const clean = text.trim()
  if (BRAZILIAN.test(clean)) return Number(clean.replace(/\./g, '').replace(',', '.'))
  return DOT_DECIMAL.test(clean) ? Number(clean) : null
}

/** Um valor salvo, de volta ao campo (`1250.5` vira `1250,5`). */
export function amountToText(value: number | null | undefined): string {
  return value === null || value === undefined ? '' : String(value).replace('.', ',')
}
