import { Children, useState, type ReactNode, type UIEvent } from 'react'

type SwipeListProps = {
  /** Nome da lista para leitores de tela, por exemplo "Lista de viagens". */
  label: string
  /** Cada filho vira um item. */
  children: ReactNode
}

/** Qual item está à vista, pela posição da rolagem. No fim da faixa, é sempre o último. */
function visibleIndex(track: HTMLElement, count: number): number {
  const end = track.scrollWidth - track.clientWidth
  if (end <= 0) return 0
  if (track.scrollLeft >= end - 1) return count - 1
  const first = track.firstElementChild as HTMLElement | null
  const second = first?.nextElementSibling as HTMLElement | null
  const step = first && second ? second.offsetLeft - first.offsetLeft : track.clientWidth
  return Math.min(Math.round(track.scrollLeft / (step || 1)), count - 1)
}

/**
 * Lista que no celular passa para o lado (com `scroll-snap`, um pedaço do próximo item à vista
 * e bolinhas com a posição) e, a partir do tablet, vira uma grade de 2 ou 3 colunas.
 */
export function SwipeList({ label, children }: SwipeListProps) {
  const items = Children.toArray(children)
  const [current, setCurrent] = useState(0)

  function handleScroll(event: UIEvent<HTMLUListElement>) {
    setCurrent(visibleIndex(event.currentTarget, items.length))
  }

  return (
    <div className="flex flex-col gap-2">
      <ul
        aria-label={label}
        onScroll={handleScroll}
        // As margens e os respiros deixam a sombra dos cartões à vista dentro da rolagem.
        className="no-scrollbar relative -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pt-1 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:p-0 lg:grid-cols-3"
      >
        {items.map((child, index) => (
          <li key={index} className="w-5/6 shrink-0 snap-start sm:w-auto">
            {child}
          </li>
        ))}
      </ul>

      {items.length > 1 && (
        <div className="flex items-center justify-center gap-2 sm:hidden">
          <span aria-hidden="true" className="flex gap-2">
            {items.map((_, index) => (
              <span
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === current ? 'w-6 bg-red-burgundy' : 'w-2 bg-rose-vintage'
                }`}
              />
            ))}
          </span>
          <span aria-live="polite" className="sr-only">
            Item {current + 1} de {items.length}
          </span>
        </div>
      )}
    </div>
  )
}
