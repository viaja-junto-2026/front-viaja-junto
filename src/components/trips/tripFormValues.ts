import type { Trip, TripInput } from '../../services/trips'

export type TripFormErrors = Partial<Record<keyof TripInput, string>>

export const emptyTrip: TripInput = {
  name: '',
  description: '',
  startDate: null,
  endDate: null,
  status: 'PLANNING',
  currency: 'BRL',
}

/** A API devolve data e hora; o campo de data usa só o dia (`2027-01-15`). */
function toDateField(value: string | null): string | null {
  return value ? value.slice(0, 10) : null
}

/** Valores do formulário a partir de uma viagem salva. */
export function toTripInput(trip: Trip): TripInput {
  return {
    name: trip.name,
    description: trip.description ?? '',
    startDate: toDateField(trip.startDate),
    endDate: toDateField(trip.endDate),
    status: trip.status,
    currency: trip.currency,
  }
}

/** Mesmas regras do back-end, para avisar antes de enviar. */
export function validateTrip(values: TripInput): TripFormErrors {
  const errors: TripFormErrors = {}
  const name = values.name.trim()

  if (!name) errors.name = 'Dê um nome à viagem.'
  else if (name.length < 2) errors.name = 'O nome deve ter pelo menos 2 caracteres.'
  else if (name.length > 120) errors.name = 'O nome deve ter no máximo 120 caracteres.'

  if (values.description.length > 2000) {
    errors.description = 'A descrição deve ter no máximo 2000 caracteres.'
  }
  // Datas no formato `AAAA-MM-DD` podem ser comparadas como texto.
  if (values.startDate && values.endDate && values.endDate < values.startDate) {
    errors.endDate = 'A data final não pode ser antes da inicial.'
  }

  return errors
}
