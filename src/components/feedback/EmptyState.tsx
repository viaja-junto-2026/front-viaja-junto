import { Inbox, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { IconCircle } from '../ui/IconCircle'

type EmptyStateProps = {
  /** Ícone do lucide-react que representa o que está vazio. */
  icon?: LucideIcon
  /** Frase que diz o que fazer: "Você ainda não tem viagens. Crie a primeira!". */
  title: string
  description?: string
  /** Botão ou link da ação principal (por exemplo, um `Button` "Nova viagem"). */
  action?: ReactNode
}

/** Estado vazio útil: ícone, uma frase e a ação para sair dele. */
export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-12 text-center">
      <IconCircle icon={Icon} size="lg" />
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-headline-sm text-red-burgundy">{title}</h2>
        {description && <p className="max-w-md text-body-md text-gray-dim">{description}</p>}
      </div>
      {action}
    </div>
  )
}
