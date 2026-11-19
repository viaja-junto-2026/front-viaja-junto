import { Inbox, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

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
      <span className="flex size-14 items-center justify-center rounded-full bg-beige-sand text-red-ruby">
        <Icon aria-hidden="true" size={28} />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-headline-sm text-red-burgundy">{title}</h2>
        {description && <p className="max-w-md text-body-md text-gray-dim">{description}</p>}
      </div>
      {action}
    </div>
  )
}
