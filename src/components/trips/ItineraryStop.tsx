import { ArrowDown, ArrowUp, CalendarDays, MapPin, Moon, Pencil, Plus } from 'lucide-react'
import type { PlannedActivity, RouteStop } from '../../hooks/useTripRoute'
import { paths } from '../../routes/paths'
import { formatDate, formatDateRange, formatDayTitle, nightsBetween } from '../../utils/format'
import { groupByDay } from '../../utils/itinerary'
import { Button } from '../ui/Button'
import { CardCompact } from '../ui/Card'
import { CoverPhoto } from '../ui/CoverPhoto'
import { IconButton } from '../ui/IconButton'
import { TextLink } from '../ui/TextLink'
import { WarningList } from '../ui/WarningList'
import { ItineraryActivity } from './ItineraryActivity'

function describeStay({ arrival, departure }: RouteStop): string {
  if (arrival && departure) return formatDateRange(arrival, departure)
  if (arrival) return `Chegada em ${formatDate(arrival)}`
  if (departure) return `Saída em ${formatDate(departure)}`
  return 'Datas a definir'
}

/** O que quem pode editar o roteiro faz em uma parada. */
export type StopActions = {
  /** Sem valor quando a parada já está no começo (ou no fim) do roteiro. */
  onMoveUp?: () => void
  onMoveDown?: () => void
  /** Bloqueia as setas enquanto a nova ordem é gravada. */
  moving?: boolean
  onEdit: () => void
  onAddActivity: () => void
  onEditActivity: (activity: PlannedActivity) => void
}

type ItineraryStopProps = {
  actions?: StopActions
  /** Problemas nas datas ou na ordem desta parada. */
  notices?: string[]
  /** Problemas das atividades, por id. */
  activityNotices?: Map<string, string>
  stop: RouteStop
  /** Posição na ordem da visita, começando em 1. */
  position: number
  /** A última parada não continua a linha da rota. */
  last: boolean
  currency: string
}

/**
 * Parada do roteiro: o número na linha da rota (tracejada, que liga uma parada à outra),
 * o destino com as datas e as atividades agrupadas por dia.
 */
export function ItineraryStop({
  stop,
  position,
  last,
  currency,
  actions,
  notices = [],
  activityNotices,
}: ItineraryStopProps) {
  const { catalog, arrival, departure, description } = stop
  const name = catalog?.name ?? 'Destino indisponível'
  const nights = arrival && departure ? nightsBetween(arrival, departure) : null

  return (
    <li className="flex gap-3 sm:gap-6">
      <div aria-hidden="true" className="flex flex-col items-center">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-burgundy text-numeric-md text-white tabular">
          {position}
        </span>
        {!last && <span className="flex-1 border-l-2 border-dashed border-rose-vintage" />}
      </div>

      <CardCompact as="article" className="relative mb-6 min-w-0 flex-1 shadow-sm sm:mb-8">
        {/* No celular é uma faixa própria; do tablet em diante fica no canto, ao lado do nome. */}
        {actions && (
          <div className="mb-3 flex items-center justify-end gap-1 border-b border-beige-sand pb-2 sm:absolute sm:top-3 sm:right-3 sm:mb-0 sm:border-0 sm:pb-0">
            <IconButton
              label={`Mover ${name} para cima`}
              variant="ghost"
              size="md"
              disabled={!actions.onMoveUp || actions.moving}
              onClick={actions.onMoveUp}
            >
              <ArrowUp aria-hidden="true" size={18} />
            </IconButton>
            <IconButton
              label={`Mover ${name} para baixo`}
              variant="ghost"
              size="md"
              disabled={!actions.onMoveDown || actions.moving}
              onClick={actions.onMoveDown}
            >
              <ArrowDown aria-hidden="true" size={18} />
            </IconButton>
            <IconButton label={`Editar ${name}`} variant="ghost" size="md" onClick={actions.onEdit}>
              <Pencil aria-hidden="true" size={18} />
            </IconButton>
          </div>
        )}
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* No celular a foto sai, para o roteiro ficar curto e fácil de ler. */}
          <div className="hidden w-48 shrink-0 self-start sm:block">
            <CoverPhoto
              src={catalog?.photoUrl ?? null}
              fallbackIcon={MapPin}
              className="rounded-xs"
              ratio="video"
            />
          </div>
          <div className={`flex min-w-0 flex-col gap-2 ${actions ? 'sm:pr-36' : ''}`}>
            <h3 className="font-heading text-headline-sm text-brown-espresso">
              <span className="sr-only">Parada {position}: </span>
              {name}
            </h3>
            {catalog?.country && (
              <p className="text-label-sm text-red-ruby uppercase">{catalog.country}</p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-body-sm text-gray-ink">
              <span className="flex items-center gap-1 tabular">
                <CalendarDays aria-hidden="true" size={16} className="text-red-ruby" />
                {describeStay(stop)}
              </span>
              {nights !== null && (
                <span className="flex items-center gap-1 tabular">
                  <Moon aria-hidden="true" size={16} className="text-red-ruby" />
                  {nights === 1 ? '1 noite' : `${nights} noites`}
                </span>
              )}
            </div>
            {description && <p className="text-body-sm text-gray-dim">{description}</p>}
            {catalog && (
              <TextLink
                to={paths.destinationDetails(catalog.id)}
                aria-label={`Ver destino ${catalog.name}`}
              >
                Ver destino
              </TextLink>
            )}
          </div>
        </div>

        {notices.length > 0 && (
          <div className="mt-4">
            <WarningList warnings={notices} />
          </div>
        )}

        {stop.activities.length === 0 ? (
          <p className="mt-4 border-t border-beige-sand pt-4 text-body-sm text-gray-dim">
            Nenhuma atividade planejada neste destino.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            {groupByDay(stop.activities).map(({ day, activities }) => (
              <section key={day ?? 'undated'} aria-label={`${name}: ${day ?? 'sem data'}`}>
                <h4 className="pt-2 pb-2 text-label-md text-gray-dim">
                  {day ? formatDayTitle(day) : 'Sem data definida'}
                </h4>
                <ul>
                  {activities.map((activity) => (
                    <ItineraryActivity
                      key={activity.id}
                      activity={activity}
                      currency={currency}
                      notice={activityNotices?.get(activity.id)}
                      onEdit={actions && (() => actions.onEditActivity(activity))}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
        {actions && (
          <div className="mt-3 flex flex-col border-t border-beige-sand pt-3 sm:flex-row">
            <Button
              variant="outline"
              leftIcon={<Plus aria-hidden="true" size={16} />}
              aria-label={`Adicionar atividade em ${name}`}
              onClick={actions.onAddActivity}
            >
              Adicionar atividade
            </Button>
          </div>
        )}
      </CardCompact>
    </li>
  )
}
