import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Children, useRef, type ReactNode } from 'react'
import { IconButton } from './IconButton'
import { SectionHeader } from './SectionHeader'

type CarouselProps = {
  /** Título da faixa (por exemplo, "Destinos mais bem avaliados"). */
  title: string
  /** Link ou botão à direita do título (por exemplo, "Ver todas"). */
  action?: ReactNode
  /** Cada filho vira um item do carrossel. */
  children: ReactNode
}

/** Quanto da largura visível cada clique nas setas rola. */
const SCROLL_FRACTION = 0.8

/**
 * Faixa horizontal com `scroll-snap`: no celular rola pelo gesto e mostra parte do próximo
 * item como dica; no desktop aparecem as setas circulares. Os itens não encolhem: defina a
 * largura de cada um (por exemplo, `w-64`).
 */
export function Carousel({ title, action, children }: CarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null)

  function scrollByPage(direction: 1 | -1) {
    const track = trackRef.current
    track?.scrollBy?.({ left: direction * track.clientWidth * SCROLL_FRACTION, behavior: 'smooth' })
  }

  return (
    <section aria-label={title} className="flex flex-col gap-6">
      <SectionHeader title={title}>
        {action}
        <span className="hidden gap-4 lg:flex">
          <IconButton label="Anteriores" onClick={() => scrollByPage(-1)}>
            <ChevronLeft aria-hidden="true" size={24} />
          </IconButton>
          <IconButton label="Próximos" onClick={() => scrollByPage(1)}>
            <ChevronRight aria-hidden="true" size={24} />
          </IconButton>
        </span>
      </SectionHeader>
      <ul
        ref={trackRef}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-4 pb-6 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0"
      >
        {Children.map(children, (child) => (
          <li className="shrink-0 snap-start">{child}</li>
        ))}
      </ul>
    </section>
  )
}
