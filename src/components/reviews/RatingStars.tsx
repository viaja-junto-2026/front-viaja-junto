import { Star } from 'lucide-react'
import { formatRating } from '../../utils/format'

type RatingStarsSize = 'sm' | 'md'

const iconSizes: Record<RatingStarsSize, number> = {
  sm: 16,
  md: 20,
}

type RatingStarsProps = {
  /** Nota de 0 a `max` (pode ser decimal, como a média 4.6). */
  rating: number
  /** Quantidade total de estrelas (padrão 5). */
  max?: number
  /** Tamanho dos ícones: `sm` (16 px) em cards e `md` (20 px) em destaques. */
  size?: RatingStarsSize
  /** Exibe também o valor numérico formatado em pt-BR (`4,6`). */
  showValue?: boolean
  className?: string
}

/**
 * Estrelas de avaliação somente leitura (reaproveitado em páginas de atividade e destino).
 * Expõe a nota legível para leitores de tela via `role="img"` e `aria-label`.
 */
export function RatingStars({
  rating,
  max = 5,
  size = 'md',
  showValue = false,
  className,
}: RatingStarsProps) {
  const clamped = Math.min(Math.max(rating, 0), max)
  const filledCount = Math.round(clamped)
  const iconSize = iconSizes[size]
  const formatted = formatRating(clamped)

  return (
    <span
      role="img"
      aria-label={`Nota ${formatted} de ${max}`}
      className={`inline-flex items-center gap-1 ${className ?? ''}`.trim()}
    >
      <span aria-hidden="true" className="inline-flex items-center gap-0.5">
        {Array.from({ length: max }, (_, index) => {
          const filled = index < filledCount
          return (
            <Star
              key={index}
              size={iconSize}
              className={filled ? 'text-red-ruby' : 'text-beige-sand'}
              fill={filled ? 'currentColor' : 'none'}
            />
          )
        })}
      </span>
      {showValue && (
        <span aria-hidden="true" className="ml-1 text-numeric-md text-gray-ink tabular">
          {formatted}
        </span>
      )}
    </span>
  )
}
