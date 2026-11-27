import { ArrowLeft } from 'lucide-react'
import { Link, type LinkProps } from 'react-router'
import { focusRing } from './focus'

/** Link de "voltar", com seta à esquerda, no topo das páginas de detalhe. */
export function BackLink({ children, ...rest }: LinkProps) {
  return (
    <Link
      className={`inline-flex w-fit items-center gap-2 rounded-xs text-label-md transition-colors text-red-burgundy hover:text-red-ruby ${focusRing}`}
      {...rest}
    >
      <ArrowLeft aria-hidden="true" size={20} />
      <span>{children}</span>
    </Link>
  )
}
