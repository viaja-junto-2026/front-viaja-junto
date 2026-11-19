import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2, Trash2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { focusRing } from './focus'

/** Formato de cada variante (altura, raio, espaçamento e texto). */
const buttonStyles = cva(
  `inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors disabled:cursor-not-allowed ${focusRing}`,
  {
    variants: {
      variant: {
        primary: 'h-12 rounded-md px-6 text-label-lg',
        secondary: 'h-12 rounded-md px-6 text-label-lg',
        compact: 'h-9 rounded-sm px-3 text-label-md',
        danger: 'h-12 rounded-md px-6 text-label-lg',
        pill: 'h-14 rounded-full px-6 text-label-lg',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: { variant: 'primary', fullWidth: false },
  },
)

type ButtonVariant = NonNullable<VariantProps<typeof buttonStyles>['variant']>

/** Cores de cada variante, com o hover só quando o botão está habilitado. */
const toneStyles: Record<ButtonVariant, string> = {
  primary: 'bg-red-ruby text-white enabled:hover:bg-red-burgundy',
  secondary: 'bg-rose-dusty text-brown-espresso enabled:hover:bg-rose-vintage',
  compact: 'bg-rose-vintage text-gray-ink enabled:hover:bg-rose-dusty',
  danger: 'bg-rose-dusty text-brown-espresso enabled:hover:bg-rose-vintage',
  pill: 'bg-red-ruby text-white enabled:hover:bg-red-burgundy',
}

/** Desabilitado fica bege acinzentado com texto tinta, bem diferente de um botão ativo. */
const disabledTone = 'bg-beige-sand text-gray-ink opacity-60'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  Omit<VariantProps<typeof buttonStyles>, 'fullWidth'> & {
    /** Mostra um indicador de carregamento e bloqueia novos cliques. */
    loading?: boolean
    /** Ícone à esquerda do texto (use ícones do lucide-react com `size={20}`). */
    leftIcon?: ReactNode
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
  fullWidth = false,
  disabled,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  const icon = leftIcon ?? (variant === 'danger' ? <Trash2 aria-hidden="true" size={20} /> : null)
  // Carregando mantém a cor da variante (um pouco esmaecida); só "desabilitado" muda de aparência.
  const tone = disabled && !loading ? disabledTone : toneStyles[variant ?? 'primary']

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${buttonStyles({ variant, fullWidth })} ${tone} ${loading ? 'opacity-70' : ''} ${className ?? ''}`.trim()}
      {...rest}
    >
      {loading ? <Loader2 aria-hidden="true" size={20} className="animate-spin" /> : icon}
      {children}
    </button>
  )
}
