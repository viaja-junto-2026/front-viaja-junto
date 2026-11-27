import type { FieldErrors } from '../../hooks/useFormFields'
import type { StopInput, TripDestination } from '../../services/itinerary'
import { formatDate } from '../../utils/format'

export const STOP_FIELDS = ['arrival', 'departure', 'description'] as const
export type StopField = (typeof STOP_FIELDS)[number]

/** Primeiro e último dia (`AAAA-MM-DD`) em que algo pode acontecer. */
export type Period = { start?: string; end?: string }

export function toDay(value: string | null | undefined): string | undefined {
  return value ? value.slice(0, 10) : undefined
}

export function toStopInput(stop?: TripDestination): StopInput {
  return {
    arrival: toDay(stop?.arrival) ?? null,
    departure: toDay(stop?.departure) ?? null,
    description: stop?.description ?? '',
  }
}

export function isOutside(day: string, { start, end }: Period): boolean {
  return Boolean((start && day < start) || (end && day > end))
}

/** `entre 15 jan. 2027 e 28 jan. 2027`, para explicar o período permitido. */
export function describePeriod({ start, end }: Period): string {
  if (start && end) return `entre ${formatDate(start)} e ${formatDate(end)}`
  return start ? `a partir de ${formatDate(start)}` : `até ${formatDate(end!)}`
}

/** Mesmas regras do back-end: a saída não vem antes da chegada, e ambas cabem na viagem. */
export function validateStop(values: StopInput, trip: Period): FieldErrors<StopField> {
  const errors: FieldErrors<StopField> = {}

  for (const field of ['arrival', 'departure'] as const) {
    const day = values[field]
    if (day && isOutside(day, trip)) {
      errors[field] = `Escolha um dia da viagem, ${describePeriod(trip)}.`
    }
  }
  if (values.arrival && values.departure && values.departure < values.arrival) {
    errors.departure = 'A saída não pode ser antes da chegada.'
  }
  if (values.description.length > 2000) {
    errors.description = 'A descrição deve ter no máximo 2000 caracteres.'
  }

  return errors
}
