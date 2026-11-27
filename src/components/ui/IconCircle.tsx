import type { LucideIcon } from 'lucide-react'

type IconCircleTone = 'sand' | 'wheat' | 'mist' | 'blush' | 'white'

const toneStyles: Record<IconCircleTone, string> = {
  sand: 'bg-beige-sand text-red-ruby',
  wheat: 'bg-yellow-wheat text-red-burgundy',
  mist: 'bg-blue-mist text-red-burgundy',
  blush: 'bg-rose-blush text-red-burgundy',
  white: 'bg-white text-red-burgundy shadow-md',
}

type IconCircleProps = {
  icon: LucideIcon
  tone?: IconCircleTone
  /** `md` (48 px) por padrão; `lg` (56 px) para estados vazios e de erro. */
  size?: 'md' | 'lg'
}

/** Ícone dentro de um círculo tingido (`stat-icon` do design system). */
export function IconCircle({ icon: Icon, tone = 'sand', size = 'md' }: IconCircleProps) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full ${toneStyles[tone]} ${
        size === 'lg' ? 'size-14' : 'size-12'
      }`}
    >
      <Icon aria-hidden="true" size={size === 'lg' ? 28 : 24} />
    </span>
  )
}
