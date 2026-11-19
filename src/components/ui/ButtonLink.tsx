import type { ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'
import { ArrowCircle } from './ArrowCircle'
import { buttonShape, linkTone, type ButtonVariant } from './buttonStyles'

type ButtonLinkProps = Omit<LinkProps, 'className'> & {
  variant?: ButtonVariant
  leftIcon?: ReactNode
  /** Ícone à direita do texto. A variante `pill` já traz o círculo com seta. */
  rightIcon?: ReactNode
  fullWidth?: boolean
  className?: string
}

/**
 * Link de navegação com a aparência de um botão (use no lugar de um `Button` quando a ação
 * é ir para outra página). Mantém o `<a>` para teclado, "abrir em nova aba" e leitores de tela.
 */
export function ButtonLink({
  variant = 'primary',
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  const trailing = rightIcon ?? (variant === 'pill' ? <ArrowCircle /> : null)

  return (
    <Link
      className={`${buttonShape({ variant, fullWidth })} ${linkTone[variant]} ${className ?? ''}`.trim()}
      {...rest}
    >
      {leftIcon}
      {children}
      {trailing}
    </Link>
  )
}
