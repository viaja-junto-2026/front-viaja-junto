import { Check } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'
import { focusRing } from './focus'

type ChipProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-pressed'> & {
  /** Chip marcado: fundo Rosa Antigo e ícone de check (a cor nunca é o único sinal). */
  selected?: boolean
}

/** Filtro ou categoria. Funciona como botão de alternância (`aria-pressed`). */
export function Chip({
  selected = false,
  className,
  children,
  type = 'button',
  ...rest
}: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={`inline-flex h-8 items-center gap-1 rounded-xs px-3 text-label-md text-gray-ink transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        selected ? 'bg-rose-vintage' : 'bg-beige-sand hover:bg-rose-blush'
      } ${focusRing} ${className ?? ''}`.trim()}
      {...rest}
    >
      {selected && <Check aria-hidden="true" size={16} />}
      {children}
    </button>
  )
}
