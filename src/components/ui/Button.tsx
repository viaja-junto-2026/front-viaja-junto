import { Loader2, Trash2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { buttonDisabledTone, buttonShape, buttonTone, type ButtonVariant } from './buttonStyles'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  /** Mostra um indicador de carregamento e bloqueia novos cliques. */
  loading?: boolean
  /** Ícone à esquerda do texto (use ícones do lucide-react com `size={20}`). */
  leftIcon?: ReactNode
  /** Ícone à direita do texto. */
  rightIcon?: ReactNode
  fullWidth?: boolean
}

/**
 * Botão do design system. Use uma única variante `primary` por tela ou card.
 * A variante `danger` mostra uma lixeira por padrão: ela deve sempre vir com confirmação.
 */
export function Button({
  variant = 'primary',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  const icon = leftIcon ?? (variant === 'danger' ? <Trash2 aria-hidden="true" size={20} /> : null)
  // Carregando mantém a cor da variante (um pouco esmaecida); só "desabilitado" muda de aparência.
  const tone = disabled && !loading ? buttonDisabledTone : buttonTone[variant]

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${buttonShape({ variant, fullWidth })} ${tone} ${loading ? 'opacity-70' : ''} ${className ?? ''}`.trim()}
      {...rest}
    >
      {loading ? <Loader2 aria-hidden="true" size={20} className="animate-spin" /> : icon}
      {children}
      {rightIcon}
    </button>
  )
}
