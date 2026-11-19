import { getInitials } from '../../utils/getInitials'

type AvatarSize = 'md' | 'sm'

const sizeStyles: Record<AvatarSize, string> = {
  md: 'size-10',
  sm: 'size-8',
}

type AvatarProps = {
  /** Nome completo da pessoa: vira as iniciais e o texto alternativo. */
  name: string
  /** `md` (40 px) por padrão; `sm` (32 px) para listas densas. */
  size?: AvatarSize
  className?: string
}

/** Círculo com as iniciais da pessoa, em Rosa Antigo com texto tinta. */
export function Avatar({ name, size = 'md', className }: AvatarProps) {
  return (
    <span
      role="img"
      aria-label={name}
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-rose-vintage text-label-md text-gray-ink ${sizeStyles[size]} ${className ?? ''}`.trim()}
    >
      <span aria-hidden="true">{getInitials(name)}</span>
    </span>
  )
}

type AvatarGroupProps = {
  /** Nomes completos, na ordem em que aparecem. */
  names: string[]
  /** Quantos avatares aparecem antes do "+N". */
  max?: number
  size?: AvatarSize
}

/** Avatares empilhados (sobreposição de 4 px e borda de 2 px branca), com "+N" para o excedente. */
export function AvatarGroup({ names, max = 4, size = 'md' }: AvatarGroupProps) {
  const visible = names.slice(0, max)
  const hidden = names.length - visible.length

  return (
    <ul aria-label={`${names.length} pessoas`} className="flex items-center -space-x-1">
      {visible.map((name, index) => (
        <li key={`${name}-${index}`}>
          <Avatar name={name} size={size} className="border-2 border-white" />
        </li>
      ))}
      {hidden > 0 && (
        <li>
          <span
            role="img"
            aria-label={`mais ${hidden} pessoas`}
            className={`inline-flex items-center justify-center rounded-full border-2 border-white bg-beige-sand text-label-md text-gray-ink ${sizeStyles[size]}`}
          >
            <span aria-hidden="true">+{hidden}</span>
          </span>
        </li>
      )}
    </ul>
  )
}
