import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes, ReactNode } from 'react'

const cardStyles = cva('bg-white text-gray-ink', {
  variants: {
    size: {
      default: 'rounded-xs p-6',
      compact: 'rounded-xs p-4',
      floating: 'rounded-xs p-4 shadow-xl',
      /** Sem respiro interno: para cards que começam com uma foto. */
      flush: 'rounded-xs',
    },
    interactive: {
      true: 'transition-shadow hover:shadow-md focus-within:shadow-md',
      false: '',
    },
  },
  defaultVariants: { size: 'default', interactive: false },
})

type CardBaseProps = HTMLAttributes<HTMLElement> &
  Pick<VariantProps<typeof cardStyles>, 'interactive'> & {
    /** Elemento HTML usado: `li` em listas, `article` para itens independentes. */
    as?: 'div' | 'article' | 'section' | 'li'
    children?: ReactNode
  }

function CardBase({
  as: Tag = 'div',
  size,
  interactive,
  className,
  ...rest
}: CardBaseProps & {
  size: 'default' | 'compact' | 'floating' | 'flush'
}) {
  return <Tag className={cardStyles({ size, interactive, className })} {...rest} />
}

/** Card para o conteúdo principal (viagem, resumo do orçamento). */
export function Card(props: CardBaseProps) {
  return <CardBase size="default" {...props} />
}

/** Card compacto para itens repetidos (atividade, despesa). */
export function CardCompact(props: CardBaseProps) {
  return <CardBase size="compact" {...props} />
}

/** Card sem respiro interno, para itens com foto de capa. */
export function FlushCard(props: CardBaseProps) {
  return <CardBase size="flush" {...props} />
}

/** Card que flutua sobre uma foto (resumo social, destaque), com sombra ampla. */
export function FloatingCard(props: CardBaseProps) {
  return <CardBase size="floating" {...props} />
}

/** Título de card em marrom. */
export function CardTitle({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`font-heading text-headline-sm text-brown-espresso ${className ?? ''}`.trim()}
      {...rest}
    />
  )
}
