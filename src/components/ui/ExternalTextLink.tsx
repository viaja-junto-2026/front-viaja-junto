import { ExternalLink } from 'lucide-react'
import type { AnchorHTMLAttributes } from 'react'
import { focusRing } from './focus'

/** Link para fora do app: abre em outra aba, sem dar acesso à janela de origem. */
export function ExternalTextLink({
  children,
  ...rest
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'target' | 'rel' | 'className'>) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 rounded-xs text-label-md underline transition-colors text-red-burgundy hover:text-red-ruby ${focusRing}`}
      {...rest}
    >
      <span>{children}</span>
      <ExternalLink aria-hidden="true" size={16} />
    </a>
  )
}
