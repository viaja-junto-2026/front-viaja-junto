import { MapPin, Plane } from 'lucide-react'
import type { ReactNode } from 'react'

/** No celular a rota é pequena e fica nos cantos, ao lado do título; no desktop, ocupa as laterais. */
const sizes = {
  compact: {
    viewBox: '0 0 80 56',
    dash: '3 6',
    stroke: 1.5,
    placement: 'h-14 w-20 lg:hidden',
  },
  wide: {
    viewBox: '0 0 280 180',
    dash: '4 8',
    stroke: 2,
    placement: 'top-1/2 hidden w-1/4 -translate-y-1/2 lg:block',
  },
}

type RouteSideProps = {
  size: keyof typeof sizes
  /** Traçado da linha dentro do desenho do tamanho escolhido. */
  path: string
  /** Ícone na ponta da linha. */
  children: ReactNode
  className: string
}

function RouteSide({ size, path, children, className }: RouteSideProps) {
  const { viewBox, dash, stroke, placement } = sizes[size]

  return (
    <svg viewBox={viewBox} className={`absolute ${placement} ${className}`}>
      <path
        d={path}
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={dash}
        className="stroke-rose-vintage"
      />
      {children}
    </svg>
  )
}

/**
 * Rota de viagem ao lado de um título centralizado: sai de um alfinete à esquerda e termina
 * em um avião à direita. É só enfeite. Vai dentro de um bloco `relative`.
 */
export function FlightRoute({ raised = false }: { raised?: boolean }) {
  // `raised` mantém a versão de celular acima do título, para ela não encostar em um título longo.
  const compactTop = raised ? 'top-1' : 'top-8'

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 text-red-ruby">
      <RouteSide
        size="compact"
        className={`left-4 ${compactTop}`}
        path="M18 46C38 56 62 46 56 32C50 21 36 30 46 38C58 44 72 28 76 10"
      >
        <MapPin x={0} y={28} width={18} height={18} strokeWidth={1.5} />
      </RouteSide>
      <RouteSide
        size="compact"
        className={`right-4 ${compactTop}`}
        path="M4 46C14 22 24 52 42 44C56 36 46 24 36 32C28 42 50 46 62 22"
      >
        <Plane x={59} y={2} width={20} height={20} strokeWidth={1.5} />
      </RouteSide>
      <RouteSide
        size="wide"
        className="left-4"
        path="M38 150C100 176 172 150 162 108C154 76 108 82 116 112C128 152 214 118 264 62"
      >
        <MapPin x={20} y={120} width={32} height={32} strokeWidth={1.5} />
      </RouteSide>
      <RouteSide
        size="wide"
        className="right-4"
        path="M16 124C66 96 108 172 164 142C208 116 178 74 148 96C122 118 176 134 206 100C218 86 224 74 232 64"
      >
        <Plane x={226} y={30} width={36} height={36} strokeWidth={1.5} />
      </RouteSide>
    </div>
  )
}
