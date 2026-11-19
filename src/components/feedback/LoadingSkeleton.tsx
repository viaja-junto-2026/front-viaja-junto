type SkeletonVariant = 'text' | 'card' | 'list' | 'photo'

type LoadingSkeletonProps = {
  /**
   * `text`: linhas de texto; `card`: blocos grandes; `list`: itens com círculo e duas linhas;
   * `photo`: fileira de cards de foto (para os carrosséis).
   */
  variant?: SkeletonVariant
  /** Quantas linhas, cards ou itens. */
  count?: number
  /** Texto lido por leitores de tela. */
  label?: string
}

const bar = 'animate-pulse rounded-sm bg-beige-sand'

/** Esqueleto de carregamento: mostra a forma do conteúdo enquanto os dados não chegam. */
export function LoadingSkeleton({
  variant = 'text',
  count = 3,
  label = 'Carregando',
}: LoadingSkeletonProps) {
  const items = Array.from({ length: count }, (_, index) => index)
  const isRow = variant === 'photo'

  return (
    <div
      role="status"
      aria-busy="true"
      className={isRow ? 'flex gap-6 overflow-hidden' : 'flex flex-col gap-4'}
    >
      <span className="sr-only">{label}</span>
      {items.map((index) => {
        if (variant === 'photo') {
          return (
            <div
              key={index}
              className="aspect-4/5 w-64 shrink-0 animate-pulse rounded-lg bg-beige-sand sm:w-72"
            />
          )
        }
        if (variant === 'card') {
          return <div key={index} className="h-40 animate-pulse rounded-lg bg-beige-sand" />
        }
        if (variant === 'list') {
          return (
            <div key={index} className="flex items-center gap-3">
              <div className="size-10 shrink-0 animate-pulse rounded-full bg-beige-sand" />
              <div className="flex flex-1 flex-col gap-2">
                <div className={`h-4 w-2/3 ${bar}`} />
                <div className={`h-3 w-1/3 ${bar}`} />
              </div>
            </div>
          )
        }
        return (
          <div key={index} className={`h-4 ${index === count - 1 ? 'w-2/3' : 'w-full'} ${bar}`} />
        )
      })}
    </div>
  )
}
