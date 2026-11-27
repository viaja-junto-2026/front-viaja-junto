import { Hourglass, Pencil, TriangleAlert, Wallet } from 'lucide-react'
import { Link } from 'react-router'
import type { PlannedActivity } from '../../hooks/useTripRoute'
import { paths } from '../../routes/paths'
import { formatCurrency, formatDuration, formatTime } from '../../utils/format'
import { activityTypeLabels } from '../../utils/labels'
import { focusRing } from '../ui/focus'
import { IconButton } from '../ui/IconButton'
import { ActivityStatusBadge } from './ActivityStatusBadge'

type ItineraryActivityProps = {
  activity: PlannedActivity
  /** Moeda da viagem, usada no custo esperado. */
  currency: string
  /** Só para quem pode editar o roteiro. */
  onEdit?: () => void
  /** Um problema desta atividade, como "Repetida". */
  notice?: string
}

/**
 * Uma atividade do roteiro: hora, nome, status, tipo, duração e custo por pessoa. A linha
 * inteira leva à página do lugar. É baixa de propósito: o roteiro pode ter muitas.
 */
export function ItineraryActivity({ activity, currency, onEdit, notice }: ItineraryActivityProps) {
  const { catalog, dateTime, durationMinutes, expectedCost, status } = activity

  return (
    <li className="relative flex gap-3 border-t border-beige-sand py-3 sm:gap-4">
      <span className="w-12 shrink-0 text-numeric-md text-red-burgundy tabular">
        {dateTime ? formatTime(dateTime) : '--:--'}
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h5 className="font-heading text-title-md text-brown-espresso">
          {catalog ? (
            // O `after` estica a área de clique do link pela linha inteira.
            <Link
              to={paths.activityDetails(catalog.id)}
              className={`rounded-xs after:absolute after:inset-0 hover:text-red-ruby ${focusRing}`}
            >
              {catalog.name}
            </Link>
          ) : (
            'Atividade indisponível'
          )}
        </h5>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-body-sm text-gray-dim">
          <ActivityStatusBadge status={status} />
          {notice && (
            <span className="inline-flex items-center gap-1 rounded-xs border border-red-ruby bg-white px-2 py-1 text-label-sm text-red-burgundy">
              <TriangleAlert aria-hidden="true" size={14} />
              {notice}
            </span>
          )}
          {catalog && <span>{activityTypeLabels[catalog.type]}</span>}
          {durationMinutes !== null && (
            <span className="flex items-center gap-1">
              <Hourglass aria-hidden="true" size={14} className="text-red-ruby" />
              <span className="sr-only">Duração:</span>
              {formatDuration(durationMinutes)}
            </span>
          )}
          {expectedCost !== null && (
            <span className="flex items-center gap-1 tabular">
              <Wallet aria-hidden="true" size={14} className="text-red-ruby" />
              <span className="sr-only">Custo esperado:</span>
              {formatCurrency(expectedCost, currency)} por pessoa
            </span>
          )}
        </div>
      </div>

      {onEdit && (
        // `relative z-10` deixa o botão clicável acima do link que cobre a linha.
        <div className="relative z-10 shrink-0 self-start">
          <IconButton
            label={`Editar atividade ${catalog?.name ?? ''}`.trim()}
            variant="ghost"
            size="md"
            onClick={onEdit}
          >
            <Pencil aria-hidden="true" size={18} />
          </IconButton>
        </div>
      )}
    </li>
  )
}
