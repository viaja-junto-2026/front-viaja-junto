import type { FieldErrors } from '../../hooks/useFormFields'
import type { TripActivity, TripActivityInput } from '../../services/itinerary'
import { amountToText, parseAmount } from '../../utils/money'
import { describePeriod, isOutside, type Period } from './stopFormValues'

export const ACTIVITY_FIELDS = [
  'dateTime',
  'time',
  'durationMinutes',
  'expectedCost',
  'status',
] as const
export type ActivityField = (typeof ACTIVITY_FIELDS)[number]

/** O maior valor que a API aceita para a duração: uma semana. */
const MAX_MINUTES = 7 * 24 * 60

/** Os campos como a pessoa preenche; a API recebe o `TripActivityInput`. */
export type ActivityValues = {
  /** Dia da atividade. O nome segue o campo da API, para o erro 422 aparecer nele. */
  dateTime: string | null
  time: string
  hours: string
  minutes: string
  expectedCost: string
  status: TripActivity['status']
}

export function toActivityValues(activity?: TripActivity): ActivityValues {
  const duration = activity?.durationMinutes ?? null
  return {
    dateTime: activity?.dateTime?.slice(0, 10) ?? null,
    time: activity?.dateTime?.slice(11, 16) ?? '',
    hours: duration === null ? '' : String(Math.floor(duration / 60)),
    minutes: duration === null ? '' : String(duration % 60),
    expectedCost: amountToText(activity?.expectedCost),
    status: activity?.status ?? 'PENDING',
  }
}

function totalMinutes({ hours, minutes }: ActivityValues): number | null {
  if (!hours.trim() && !minutes.trim()) return null
  return Number(hours || 0) * 60 + Number(minutes || 0)
}

export function validateActivity(values: ActivityValues, stay: Period): FieldErrors<ActivityField> {
  const errors: FieldErrors<ActivityField> = {}

  if (values.dateTime && isOutside(values.dateTime, stay)) {
    errors.dateTime = `Escolha um dia da estadia, ${describePeriod(stay)}.`
  }
  if (values.dateTime && !values.time) errors.time = 'Escolha o horário.'
  if (!values.dateTime && values.time) errors.dateTime = 'Escolha o dia desse horário.'

  const onlyDigits = /^\d*$/
  const duration = totalMinutes(values)
  if (!onlyDigits.test(values.hours.trim()) || !onlyDigits.test(values.minutes.trim())) {
    errors.durationMinutes = 'Use só números na duração.'
  } else if (duration !== null && (duration < 1 || duration > MAX_MINUTES)) {
    errors.durationMinutes = 'A duração vai de 1 minuto a 168 horas (uma semana).'
  }

  if (values.expectedCost.trim() && parseAmount(values.expectedCost) === null) {
    errors.expectedCost = 'Informe um valor como 150 ou 150,50.'
  }

  return errors
}

/** Converte o formulário para o que a API recebe. A hora é guardada como UTC. */
export function toActivityInput(values: ActivityValues): TripActivityInput {
  return {
    dateTime: values.dateTime && values.time ? `${values.dateTime}T${values.time}:00.000Z` : null,
    durationMinutes: totalMinutes(values),
    expectedCost: values.expectedCost.trim() ? parseAmount(values.expectedCost) : null,
    status: values.status,
  }
}

/** Horários de meia em meia hora; um horário salvo fora disso continua na lista. */
export function timeOptions(current: string) {
  const times = Array.from({ length: 48 }, (_, index) => {
    const hour = String(Math.floor(index / 2)).padStart(2, '0')
    return `${hour}:${index % 2 ? '30' : '00'}`
  })
  const all = current && !times.includes(current) ? [...times, current].sort() : times
  return all.map((time) => ({ value: time, label: time }))
}
