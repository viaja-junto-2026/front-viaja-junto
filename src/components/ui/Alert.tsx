import { CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export type AlertVariant = 'success' | 'warning' | 'error' | 'info'

const variantConfig: Record<AlertVariant, { icon: LucideIcon; style: string }> = {
  success: { icon: CircleCheck, style: 'bg-green-mint' },
  warning: { icon: TriangleAlert, style: 'bg-yellow-wheat' },
  error: { icon: CircleAlert, style: 'bg-rose-blush' },
  info: { icon: Info, style: 'bg-blue-mist' },
}

type AlertProps = {
  variant: AlertVariant
  /** Título curto em negrito (opcional). */
  title?: string
  children: ReactNode
  className?: string
}

/**
 * Aviso para o usuário, sempre com ícone e texto (a cor nunca é o único sinal).
 * Erros usam `role="alert"` (lidos na hora); os demais usam `role="status"`.
 */
export function Alert({ variant, title, children, className }: AlertProps) {
  const { icon: Icon, style } = variantConfig[variant]

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-md p-4 text-body-sm text-gray-ink ${style} ${className ?? ''}`.trim()}
    >
      <Icon aria-hidden="true" size={20} className="shrink-0" />
      <div>
        {title && <p className="text-label-md">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  )
}
