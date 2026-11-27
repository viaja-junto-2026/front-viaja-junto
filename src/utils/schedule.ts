/**
 * Coerência do roteiro. O back-end só confere se as datas cabem na viagem (parada) e se o
 * início da atividade cai na estadia; estas regras evitam o que ele deixa passar. Valem só
 * no app: quem chamar a API direto não é barrado.
 */
import type { PlannedActivity, RouteStop } from '../hooks/useTripRoute'
import type { TripDestination } from '../services/itinerary'
import { formatDate, formatTime } from './format'

const MINUTE = 60_000
const DAY = 24 * 60 * MINUTE

/** Resultado da conferência de um item antes de salvar. */
export type Review = {
  /** Impede salvar. */
  blocker?: string
  /** Só avisa: a pessoa pode salvar mesmo assim. */
  warnings: string[]
}

const day = (value: string | null | undefined) => value?.slice(0, 10) ?? null
const time = (value: string) => new Date(value).getTime()
const nameOf = (activity: PlannedActivity) => activity.catalog?.name ?? 'uma atividade'

function allActivities(stops: RouteStop[]): PlannedActivity[] {
  return stops.flatMap((stop) => stop.activities)
}

/** Mesmo lugar, no mesmo dia e horário. */
function isSameBooking(
  activity: PlannedActivity,
  catalogId: string,
  dateTime: string | null,
): boolean {
  if (activity.activityCatalogId !== catalogId) return false
  if (!dateTime || !activity.dateTime) return false
  return time(activity.dateTime) === time(dateTime)
}

/**
 * Se os horários se cruzam. Sem duração, a atividade vale como um instante. Começar na
 * hora em que a outra termina não é choque.
 */
function overlaps(
  a: { dateTime: string; durationMinutes: number | null },
  b: { dateTime: string; durationMinutes: number | null },
): boolean {
  const startA = time(a.dateTime)
  const startB = time(b.dateTime)
  const endA = startA + (a.durationMinutes ?? 0) * MINUTE
  const endB = startB + (b.durationMinutes ?? 0) * MINUTE
  return startA === startB || (startA < endB && startB < endA)
}

type ActivityCandidate = {
  /** Sem valor enquanto nada foi escolhido no catálogo. */
  catalogId?: string
  isLodging: boolean
  dateTime: string | null
  durationMinutes: number | null
}

/**
 * Confere uma atividade antes de salvar. Na edição, informe `current`: uma repetição que já
 * existia não impede mudar o status ou o custo, só criar uma nova.
 */
export function reviewActivity(
  stops: RouteStop[],
  stop: RouteStop,
  candidate: ActivityCandidate,
  current?: PlannedActivity,
): Review {
  const { catalogId, dateTime, durationMinutes, isLodging } = candidate
  const others = allActivities(stops).filter((activity) => activity.id !== current?.id)
  const warnings: string[] = []

  const unchanged =
    current?.dateTime && dateTime ? time(current.dateTime) === time(dateTime) : false
  const repeated =
    catalogId && !unchanged
      ? others.find((activity) => isSameBooking(activity, catalogId, dateTime))
      : undefined
  const blocker = repeated
    ? `${nameOf(repeated)} já está no roteiro nesse dia e horário. Escolha outro horário.`
    : undefined

  if (!blocker && dateTime) {
    // A hospedagem ocupa vários dias: ela não conta como choque, de nenhum dos lados.
    const clashes = isLodging
      ? []
      : others.filter(
          (activity) =>
            activity.dateTime &&
            activity.catalog?.type !== 'LODGING' &&
            overlaps(
              { dateTime, durationMinutes },
              { dateTime: activity.dateTime, durationMinutes: activity.durationMinutes },
            ),
        )
    if (clashes.length > 0) {
      // Itens já repetidos no roteiro aparecem uma vez só.
      const labels = clashes.map(
        (activity) => `${nameOf(activity)} (${formatTime(activity.dateTime!)})`,
      )
      warnings.push(`Nesse horário já há: ${[...new Set(labels)].join(', ')}.`)
    }

    const departure = day(stop.departure)
    // Compara em milissegundos: uma duração absurda, ainda sendo digitada, não vira data.
    if (departure && durationMinutes) {
      const endOfStay = time(`${departure}T00:00:00.000Z`) + DAY
      if (time(dateTime) + durationMinutes * MINUTE > endOfStay) {
        warnings.push(`Pela duração, ela termina depois da saída, em ${formatDate(departure)}.`)
      }
    }
  }

  return { blocker, warnings }
}

type StopCandidate = {
  catalogId?: string
  arrival: string | null
  departure: string | null
}

/** Atividades da parada que ficariam fora de um período novo. */
function activitiesOutside(stop: RouteStop, arrival: string | null, departure: string | null) {
  return stop.activities.filter((activity) => {
    const when = day(activity.dateTime)
    return Boolean(when && ((arrival && when < arrival) || (departure && when > departure)))
  })
}

/** Confere uma parada antes de salvar. Na edição, informe `current`. */
export function reviewStop(
  stops: RouteStop[],
  candidate: StopCandidate,
  current?: RouteStop,
): Review {
  const { catalogId, arrival, departure } = candidate
  const others = stops.filter((stop) => stop.id !== current?.id)
  const warnings: string[] = []

  // Só o que a mudança passaria a deixar de fora: o que já está fora não impede o resto.
  const alreadyOutside = current
    ? activitiesOutside(current, day(current.arrival), day(current.departure))
    : []
  const stranded = current
    ? activitiesOutside(current, arrival, departure).filter((a) => !alreadyOutside.includes(a))
    : []
  if (stranded.length > 0) {
    const names = [...new Set(stranded.map(nameOf))].join(', ')
    return {
      blocker: `Com essas datas, ficariam fora do período: ${names}. Antes, mude o dia dessas atividades ou exclua-as.`,
      warnings,
    }
  }

  const unchanged = current
    ? day(current.arrival) === arrival && day(current.departure) === departure
    : false
  const repeated =
    !unchanged &&
    others.some(
      (stop) =>
        stop.destinationCatalogId === catalogId &&
        day(stop.arrival) === arrival &&
        day(stop.departure) === departure,
    )
  if (repeated) {
    return {
      blocker: 'Esse destino já está no roteiro com as mesmas datas. Escolha outro período.',
      warnings,
    }
  }

  // Sair de um lugar e chegar em outro no mesmo dia é o normal de uma viagem.
  const crossing = others.filter((stop) => {
    const start = day(stop.arrival)
    const end = day(stop.departure)
    return Boolean(arrival && departure && start && end && arrival < end && start < departure)
  })
  if (crossing.length > 0) {
    const names = crossing.map((stop) => stop.catalog?.name ?? 'outro destino').join(', ')
    warnings.push(`Essas datas se cruzam com as de: ${names}.`)
  }

  return { warnings }
}

/** Paradas que ficariam fora das datas novas da viagem. */
export function stopsOutsideTrip(
  stops: TripDestination[],
  start: string | null,
  end: string | null,
): TripDestination[] {
  const first = day(start)
  const last = day(end)
  return stops.filter((stop) =>
    [day(stop.arrival), day(stop.departure)].some(
      (date) => date !== null && Boolean((first && date < first) || (last && date > last)),
    ),
  )
}

/** Avisos de uma parada que já está no roteiro, por id. */
export function stopNotices(
  stops: RouteStop[],
  trip: { startDate: string | null; endDate: string | null },
): Map<string, string[]> {
  const outside = new Set(
    stopsOutsideTrip(stops, trip.startDate, trip.endDate).map((stop) => stop.id),
  )

  return new Map(
    stops.map((stop, index) => {
      const notices: string[] = []
      if (outside.has(stop.id))
        notices.push('Fora das datas da viagem. Ajuste a chegada ou a saída.')
      const previous = stops[index - 1]
      const arrival = day(stop.arrival)
      const previousArrival = day(previous?.arrival)
      if (arrival && previousArrival && arrival < previousArrival) {
        notices.push('Na ordem atual, vem depois de um destino que começa mais tarde.')
      }
      return [stop.id, notices]
    }),
  )
}

/** Avisos das atividades que já estão no roteiro, por id. */
export function activityNotices(stops: RouteStop[]): Map<string, string> {
  const notices = new Map<string, string>()
  const everything = allActivities(stops)

  for (const stop of stops) {
    const outside = new Set(
      activitiesOutside(stop, day(stop.arrival), day(stop.departure)).map((a) => a.id),
    )
    for (const activity of stop.activities) {
      if (outside.has(activity.id)) {
        notices.set(activity.id, 'Fora das datas')
      } else if (
        everything.some(
          (other) =>
            other.id !== activity.id &&
            isSameBooking(other, activity.activityCatalogId, activity.dateTime),
        )
      ) {
        notices.set(activity.id, 'Repetida')
      }
    }
  }

  return notices
}
