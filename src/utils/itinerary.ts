import type { TripActivity, TripDestination } from '../services/itinerary'

/** Paradas na ordem da visita; as sem ordem vão para o fim, pela data de chegada. */
export function sortStops(stops: TripDestination[]): TripDestination[] {
  return [...stops].sort(
    (a, b) =>
      (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER) ||
      (a.arrival ?? '9999').localeCompare(b.arrival ?? '9999'),
  )
}

export type ActivityDay<TActivity> = {
  /** Dia `AAAA-MM-DD`, ou `null` para as atividades sem data. */
  day: string | null
  activities: TActivity[]
}

/** Agrupa as atividades por dia, em ordem cronológica; as sem data ficam no último grupo. */
export function groupByDay<TActivity extends Pick<TripActivity, 'dateTime'>>(
  activities: TActivity[],
): ActivityDay<TActivity>[] {
  const ordered = [...activities].sort((a, b) =>
    (a.dateTime ?? '9999').localeCompare(b.dateTime ?? '9999'),
  )
  const days: ActivityDay<TActivity>[] = []

  for (const activity of ordered) {
    const day = activity.dateTime?.slice(0, 10) ?? null
    const last = days[days.length - 1]
    if (last && last.day === day) last.activities.push(activity)
    else days.push({ day, activities: [activity] })
  }

  return days
}
