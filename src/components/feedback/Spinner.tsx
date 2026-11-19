import { Loader2 } from 'lucide-react'

type SpinnerSize = 'sm' | 'md' | 'lg'

const sizes: Record<SpinnerSize, number> = { sm: 16, md: 24, lg: 40 }

type SpinnerProps = {
  size?: SpinnerSize
  /** Texto lido por leitores de tela (não aparece na tela). */
  label?: string
  className?: string
}

/** Indicador de carregamento girando, na cor da marca. */
export function Spinner({ size = 'md', label = 'Carregando', className }: SpinnerProps) {
  return (
    <span role="status" className={`inline-flex text-red-ruby ${className ?? ''}`.trim()}>
      <Loader2 aria-hidden="true" size={sizes[size]} className="animate-spin" />
      <span className="sr-only">{label}</span>
    </span>
  )
}
