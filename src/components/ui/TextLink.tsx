import { ArrowRight } from 'lucide-react'
import { Link, type LinkProps } from 'react-router'
import { focusRing } from './focus'

/** Link de texto em Bordô com seta, para "Ver todas" e atalhos parecidos. */
export function TextLink({ children, className, ...rest }: LinkProps) {
  return (
    <Link
      className={`inline-flex items-center gap-1 whitespace-nowrap text-label-lg text-red-burgundy underline-offset-4 hover:underline ${focusRing} ${className ?? ''}`.trim()}
      {...rest}
    >
      {children}
      <ArrowRight aria-hidden="true" size={20} />
    </Link>
  )
}
