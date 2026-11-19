import { tripStatusLabels, type TripStatus } from '../../utils/labels'

const statusStyles: Record<TripStatus, string> = {
  PLANNING: 'bg-blue-mist',
  CONFIRMED: 'bg-green-mint',
  COMPLETED: 'bg-beige-sand',
}

type BadgeProps = {
  /** Status da viagem, como a API devolve (PLANNING, CONFIRMED ou COMPLETED). */
  status: TripStatus
  className?: string
}

/** Selo do status da viagem: sempre com texto (em caixa alta), nunca só a cor. */
export function Badge({ status, className }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-xs px-2 py-1 text-label-sm text-gray-ink uppercase ${statusStyles[status]} ${className ?? ''}`.trim()}
    >
      {tripStatusLabels[status]}
    </span>
  )
}
