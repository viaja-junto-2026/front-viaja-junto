import { tripStatusLabels, type TripStatus } from '../../utils/labels'
import { tripStatusIcons } from './tripStatusIcons'

const statusColors: Record<TripStatus, string> = {
  PLANNING: 'bg-blue-mist',
  CONFIRMED: 'bg-green-mint',
  COMPLETED: 'bg-beige-sand',
}

/** Selo do status da viagem: sempre com ícone e texto (em caixa alta), nunca só a cor. */
export function TripStatusBadge({ status }: { status: TripStatus }) {
  const Icon = tripStatusIcons[status]

  return (
    <span
      className={`inline-flex w-fit items-center gap-1 rounded-xs px-2 py-1 text-label-sm text-gray-ink uppercase ${statusColors[status]}`}
    >
      <Icon aria-hidden="true" size={14} />
      {tripStatusLabels[status]}
    </span>
  )
}
