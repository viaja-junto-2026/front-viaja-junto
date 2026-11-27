import { CircleCheck, Flag, PencilRuler, type LucideIcon } from 'lucide-react'
import { tripStatusLabels, type TripStatus } from '../../utils/labels'

const statusStyles: Record<TripStatus, { color: string; icon: LucideIcon }> = {
  PLANNING: { color: 'bg-blue-mist', icon: PencilRuler },
  CONFIRMED: { color: 'bg-green-mint', icon: CircleCheck },
  COMPLETED: { color: 'bg-beige-sand', icon: Flag },
}

/** Selo do status da viagem: sempre com ícone e texto (em caixa alta), nunca só a cor. */
export function TripStatusBadge({ status }: { status: TripStatus }) {
  const { color, icon: Icon } = statusStyles[status]

  return (
    <span
      className={`inline-flex w-fit items-center gap-1 rounded-xs px-2 py-1 text-label-sm text-gray-ink uppercase ${color}`}
    >
      <Icon aria-hidden="true" size={14} />
      {tripStatusLabels[status]}
    </span>
  )
}
