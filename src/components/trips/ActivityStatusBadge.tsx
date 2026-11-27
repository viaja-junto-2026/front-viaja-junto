import { CircleCheck, Clock, Flag, type LucideIcon } from 'lucide-react'
import { activityStatusLabels, type ActivityStatus } from '../../utils/labels'

const styles: Record<ActivityStatus, { color: string; icon: LucideIcon }> = {
  PENDING: { color: 'bg-yellow-wheat', icon: Clock },
  CONFIRMED: { color: 'bg-green-mint', icon: CircleCheck },
  COMPLETED: { color: 'bg-beige-sand', icon: Flag },
}

/** Selo do status de uma atividade da viagem: ícone e texto, nunca só a cor. */
export function ActivityStatusBadge({ status }: { status: ActivityStatus }) {
  const { color, icon: Icon } = styles[status]

  return (
    <span
      className={`inline-flex w-fit items-center gap-1 rounded-xs px-2 py-1 text-label-sm text-gray-ink uppercase ${color}`}
    >
      <Icon aria-hidden="true" size={14} />
      {activityStatusLabels[status]}
    </span>
  )
}
