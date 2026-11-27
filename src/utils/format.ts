/**
 * Formatação de valores em pt-BR, conforme o DESIGN.md: `R$ 1.250,00` e `12 mar. 2027`.
 * As datas da API são dias de calendário (`2027-03-12`): tudo aqui usa UTC para o dia
 * não "voltar" por causa do fuso horário do navegador.
 */

const LOCALE = 'pt-BR'
const MS_PER_DAY = 86_400_000
/** Texto mostrado no lugar de uma data inválida ou ausente (a tela não quebra). */
const EMPTY_DATE = '—'

type DateInput = string | Date

/**
 * Valor em dinheiro com decimais, como o orçamento e o custo esperado de uma atividade
 * (`1250` vira `R$ 1.250,00`). Despesas vêm em centavos: use `formatCurrencyFromCents`.
 */
export function formatCurrency(value: number, currency = 'BRL'): string {
  return new Intl.NumberFormat(LOCALE, { style: 'currency', currency }).format(value)
}

/** Valor em centavos, como as despesas da API (`125000` vira `R$ 1.250,00`). */
export function formatCurrencyFromCents(cents: number, currency = 'BRL'): string {
  return formatCurrency(cents / 100, currency)
}

/** Porcentagem inteira como no DESIGN.md: `62 %`, sem quebrar a linha no meio. */
export function formatPercent(value: number): string {
  return `${new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 }).format(value)}\u00a0%`
}

function toDate(input: DateInput): Date | null {
  const date = input instanceof Date ? input : new Date(input)
  return Number.isNaN(date.getTime()) ? null : date
}

const dateParts = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

/** Dia, mês abreviado (`mar.`) e ano de uma data. */
function getParts(date: Date): { day: string; month: string; year: string } {
  const parts = dateParts.formatToParts(date)
  const find = (type: string) => parts.find((part) => part.type === type)?.value ?? ''
  return { day: find('day'), month: find('month'), year: find('year') }
}

/** Dia de calendário (UTC) em milissegundos, sem a hora. */
function toDayNumber(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

/** Data curta: `12 mar. 2027`. Devolve `—` se a data for inválida. */
export function formatDate(input: DateInput): string {
  const date = toDate(input)
  if (!date) return EMPTY_DATE
  const { day, month, year } = getParts(date)
  return `${day} ${month} ${year}`
}

/**
 * Período de uma viagem:
 * - mesmo ano: `12 de mar. – 2 de abr. de 2027`;
 * - mesmo mês: `12 – 20 de mar. de 2027`;
 * - anos diferentes: `20 de dez. de 2027 – 5 de jan. de 2028`.
 * Devolve `—` se alguma das datas for inválida.
 */
export function formatDateRange(start: DateInput, end: DateInput): string {
  const startDate = toDate(start)
  const endDate = toDate(end)
  if (!startDate || !endDate) return EMPTY_DATE

  const from = getParts(startDate)
  const to = getParts(endDate)

  if (from.year !== to.year) {
    return `${from.day} de ${from.month} de ${from.year} – ${to.day} de ${to.month} de ${to.year}`
  }
  if (from.month === to.month) {
    return `${from.day} – ${to.day} de ${to.month} de ${to.year}`
  }
  return `${from.day} de ${from.month} – ${to.day} de ${to.month} de ${to.year}`
}

/** Quantas noites há entre duas datas (`1 a 5 de março` são 4 noites). Nunca é negativo. */
export function nightsBetween(start: DateInput, end: DateInput): number {
  const startDate = toDate(start)
  const endDate = toDate(end)
  if (!startDate || !endDate) return 0
  const nights = Math.round((toDayNumber(endDate) - toDayNumber(startDate)) / MS_PER_DAY)
  return Math.max(nights, 0)
}

/**
 * Quantos dias faltam até uma data (`0` é hoje, negativo é no passado).
 * O "hoje" é o dia de calendário local de quem usa o app; `now` existe para os testes.
 */
export function daysUntil(input: DateInput, now: Date = new Date()): number {
  const date = toDate(input)
  if (!date) return 0
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((toDayNumber(date) - today) / MS_PER_DAY)
}

const dayFormat = new Intl.DateTimeFormat(LOCALE, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
})

/** Título de um dia do roteiro: `Sexta-feira, 15 de janeiro`. */
export function formatDayTitle(input: DateInput): string {
  const date = toDate(input)
  if (!date) return EMPTY_DATE
  const title = dayFormat.format(date)
  return title.charAt(0).toUpperCase() + title.slice(1)
}

/**
 * Hora de uma atividade: `14:00`. A API guarda a hora marcada no destino como UTC, então
 * ela é mostrada sem converter para o fuso do navegador.
 */
export function formatTime(input: DateInput): string {
  const date = toDate(input)
  return date ? date.toISOString().slice(11, 16) : EMPTY_DATE
}

/** Duração em minutos: `45 min`, `3 h`, `1 h 30 min`, `4 dias`, `1 dia e 2 h`. */
export function formatDuration(minutes: number): string {
  const days = Math.floor(minutes / 1440)
  const rest = minutes % 1440
  const hours = Math.floor(rest / 60)
  const mins = rest % 60
  const time = [hours > 0 && `${hours} h`, mins > 0 && `${mins} min`].filter(Boolean).join(' ')

  if (days === 0) return time || '0 min'
  const dayText = days === 1 ? '1 dia' : `${days} dias`
  return time ? `${dayText} e ${time}` : dayText
}

const ratingFormat = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

/** Nota média com uma casa decimal e vírgula: `4,8`. */
export function formatRating(value: number): string {
  return ratingFormat.format(value)
}

/** Contagem de avaliações no singular ou no plural: `1 avaliação`, `12 avaliações`. */
export function formatReviewCount(count: number): string {
  return count === 1 ? '1 avaliação' : `${count} avaliações`
}
