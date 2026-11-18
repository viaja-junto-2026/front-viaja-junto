import { Bell, Globe, Plane, User, type LucideIcon } from 'lucide-react'
import { paths } from '../../routes/paths'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}

/** Links da barra superior (desktop). */
export const topNavItems: Pick<NavItem, 'label' | 'to'>[] = [
  { label: 'Minhas viagens', to: paths.trips },
  { label: 'Descobrir', to: paths.destinations },
  { label: 'Avaliações', to: paths.reviews },
]

/** Destinos da barra inferior (celular). */
export const bottomNavItems: NavItem[] = [
  { label: 'Viagens', to: paths.trips, icon: Plane },
  { label: 'Descobrir', to: paths.destinations, icon: Globe },
  { label: 'Avisos', to: paths.notifications, icon: Bell },
  { label: 'Perfil', to: paths.profile, icon: User },
]
