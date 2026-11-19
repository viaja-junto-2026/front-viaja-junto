import type { components } from '../../services/generated/schema'

/** Status da viagem, como a API devolve (PLANNING, CONFIRMED ou COMPLETED). */
export type TripStatus = components['schemas']['TripResponseDto']['status']

const statusConfig: Record<TripStatus, { label: string; style: string }> = {
  PLANNING: { label: 'Planejando', style: 'bg-blue-mist' },
  CONFIRMED: { label: 'Confirmada', style: 'bg-green-mint' },
  COMPLETED: { label: 'Concluída', style: 'bg-beige-sand' },
}

type BadgeProps = {
  status: TripStatus
  className?: string
}

/** Selo do status da viagem: sempre com texto (em caixa alta), nunca só a cor. */
export function Badge({ status, className }: BadgeProps) {
  const { label, style } = statusConfig[status]

  return (
    <span
      className={`inline-flex items-center rounded-xs px-2 py-1 text-label-sm text-gray-ink uppercase ${style} ${className ?? ''}`.trim()}
    >
      {label}
    </span>
  )
}
