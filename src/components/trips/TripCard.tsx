import { CalendarDays, Pencil, UserRound } from 'lucide-react'
import { Link } from 'react-router'
import { paths } from '../../routes/paths'
import type { Trip } from '../../services/trips'
import { formatDate, formatDateRange } from '../../utils/format'
import { memberRoleLabels } from '../../utils/labels'
import { ButtonLink } from '../ui/ButtonLink'
import { focusRing } from '../ui/focus'
import { TicketPerforation } from '../ui/TicketPerforation'
import { TripStatusBadge } from './TripStatusBadge'

/** As datas são opcionais na API: mostra o período, só uma das datas ou avisa que faltam. */
function describeDates({ startDate, endDate }: Trip): string {
  if (startDate && endDate) return formatDateRange(startDate, endDate)
  if (startDate) return `A partir de ${formatDate(startDate)}`
  if (endDate) return `Até ${formatDate(endDate)}`
  return 'Datas a definir'
}

/**
 * Viagem em forma de cartão de embarque: status, nome e descrição em cima; datas e o papel
 * da pessoa no canhoto. O cartão inteiro leva ao detalhe da viagem.
 */
export function TripCard({ trip }: { trip: Trip }) {
  return (
    <article className="relative flex h-full flex-col drop-shadow-ticket-rest transition-all hover:drop-shadow-ticket">
      <div className="flex flex-1 flex-col gap-2 rounded-t-xs bg-white px-4 pt-4 sm:px-6 sm:pt-5">
        <div className="flex items-center justify-between gap-3">
          <TripStatusBadge status={trip.status} />
          {trip.role === 'OWNER' && (
            // `relative z-10` deixa o botão clicável acima do link que cobre o cartão.
            <ButtonLink
              to={paths.tripEdit(trip.id)}
              variant="compact"
              aria-label={`Editar ${trip.name}`}
              leftIcon={<Pencil aria-hidden="true" size={16} />}
              className="relative z-10 h-11 w-11 sm:h-9 sm:w-auto"
            >
              {/* No celular o botão fica só com o ícone, para o cartão ficar baixo. */}
              <span className="hidden sm:inline">Editar</span>
            </ButtonLink>
          )}
        </div>
        <h2 className="font-heading text-title-md text-brown-espresso sm:text-headline-sm">
          {/* O `after` estica a área de clique do link pelo cartão inteiro. */}
          <Link
            to={paths.tripDetails(trip.id)}
            className={`rounded-xs after:absolute after:inset-0 hover:text-red-ruby ${focusRing}`}
          >
            {trip.name}
          </Link>
        </h2>
        {trip.description && (
          <p className="line-clamp-1 text-body-sm text-gray-dim sm:line-clamp-2">
            {trip.description}
          </p>
        )}
      </div>
      <TicketPerforation />
      <dl className="flex flex-col gap-1 rounded-b-xs bg-white px-4 pb-4 text-body-sm text-gray-ink sm:gap-2 sm:px-6 sm:pb-5">
        <div className="flex items-center gap-2">
          <dt className="flex text-red-ruby">
            <CalendarDays aria-hidden="true" size={18} />
            <span className="sr-only">Datas</span>
          </dt>
          <dd className="tabular">{describeDates(trip)}</dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="flex text-red-ruby">
            <UserRound aria-hidden="true" size={18} />
            <span className="sr-only">Seu papel</span>
          </dt>
          <dd>{memberRoleLabels[trip.role]}</dd>
        </div>
      </dl>
    </article>
  )
}
