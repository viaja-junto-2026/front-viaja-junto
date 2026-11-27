import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { IconCircle } from './IconCircle'
import { DisplayTitle } from './DisplayTitle'

type PageMessageProps = {
  icon: LucideIcon
  /** Título da página (vira o `h1`). */
  title: string
  description: string
  /** Botão ou link para sair da situação. */
  action: ReactNode
  /** Anuncia na hora para leitores de tela (use em páginas de erro). */
  alert?: boolean
}

/** Mensagem que ocupa a página inteira: não encontrado, endereço errado ou tela quebrada. */
export function PageMessage({ icon, title, description, action, alert }: PageMessageProps) {
  return (
    <section
      role={alert ? 'alert' : undefined}
      className="flex flex-col items-center gap-4 px-4 py-12 text-center"
    >
      <IconCircle icon={icon} size="lg" />
      <div className="flex flex-col gap-1">
        <DisplayTitle>{title}</DisplayTitle>
        <p className="max-w-md text-body-md text-gray-dim">{description}</p>
      </div>
      {action}
    </section>
  )
}
