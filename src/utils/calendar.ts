/**
 * Contas do calendário. As datas são textos `AAAA-MM-DD` (dias de calendário) e tudo usa
 * UTC, para o dia não mudar com o fuso do navegador.
 */

const WEEKS_PER_MONTH = 6
const DAYS_PER_WEEK = 7

function toUtc(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00Z`)
}

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** O dia de hoje no fuso de quem usa o app. `now` existe para os testes. */
export function todayIso(now: Date = new Date()): string {
  return toIso(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())))
}

export function addDays(isoDate: string, days: number): string {
  const date = toUtc(isoDate)
  date.setUTCDate(date.getUTCDate() + days)
  return toIso(date)
}

/** Soma meses mantendo o dia; se o mês de destino for menor, fica no último dia dele. */
export function addMonths(isoDate: string, months: number): string {
  const date = toUtc(isoDate)
  const day = date.getUTCDate()
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1))
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate()
  target.setUTCDate(Math.min(day, lastDay))
  return toIso(target)
}

/** Dia da semana, de 0 (domingo) a 6 (sábado). */
export function weekDay(isoDate: string): number {
  return toUtc(isoDate).getUTCDay()
}

/**
 * Semanas do mês de `isoDate`, começando no domingo. São sempre 6, para o calendário não
 * mudar de altura; as posições fora do mês são `null`.
 */
export function monthWeeks(isoDate: string): (string | null)[][] {
  const month = isoDate.slice(0, 7)
  const first = `${month}-01`
  const start = addDays(first, -weekDay(first))

  return Array.from({ length: WEEKS_PER_MONTH }, (_, week) =>
    Array.from({ length: DAYS_PER_WEEK }, (_, index) => {
      const day = addDays(start, week * DAYS_PER_WEEK + index)
      return day.startsWith(month) ? day : null
    }),
  )
}

const monthFormat = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

const longFormat = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

/** Título do mês: `Março de 2027`. */
export function formatMonthTitle(isoDate: string): string {
  const title = monthFormat.format(toUtc(isoDate))
  return title.charAt(0).toUpperCase() + title.slice(1)
}

/** Data por extenso, para leitores de tela: `10 de março de 2027`. */
export function formatLongDate(isoDate: string): string {
  return longFormat.format(toUtc(isoDate))
}
