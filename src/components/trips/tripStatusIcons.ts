import { CircleCheck, Flag, PencilRuler, type LucideIcon } from 'lucide-react'
import type { TripStatus } from '../../utils/labels'

/** Ícone de cada status, o mesmo no selo do card e no filtro. */
export const tripStatusIcons: Record<TripStatus, LucideIcon> = {
  PLANNING: PencilRuler,
  CONFIRMED: CircleCheck,
  COMPLETED: Flag,
}
