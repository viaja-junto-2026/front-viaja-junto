import type { ReactNode } from 'react'

type TicketCardProps = {
  /** Parte de cima do bilhete: marca, título e apresentação. */
  children: ReactNode
  /** Canhoto, abaixo do picote: a ação da tela. */
  stub: ReactNode
}

/** Lateral do picote: um bloco branco com um furo em meia-lua (transparente) do lado esquerdo. */
function Notch({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 32" className={`h-8 w-4 shrink-0 fill-white ${className ?? ''}`.trim()}>
      <path d="M0 0A16 16 0 0 1 0 32H16V0Z" />
    </svg>
  )
}

/**
 * Cartão em forma de cartão de embarque: duas partes separadas por um picote com um furo
 * em cada lado. A sombra é `drop-shadow` (e não `shadow`) para acompanhar o contorno dos furos.
 */
export function TicketCard({ children, stub }: TicketCardProps) {
  return (
    <div className="flex flex-col drop-shadow-ticket">
      <div className="flex flex-col items-center gap-5 rounded-t-xs bg-white px-6 pt-14 pb-6 text-center sm:px-10">
        {children}
      </div>
      {/* As margens de 1 px sobrepõem as peças: sem isso a sombra vaza pelas emendas. */}
      <div aria-hidden="true" className="-my-px flex h-8">
        <Notch />
        <div className="-mx-px flex flex-1 items-center bg-white px-4">
          <div className="flex-1 border-t-2 border-dashed border-beige-sand" />
        </div>
        <Notch className="rotate-180" />
      </div>
      <div className="flex flex-col gap-4 rounded-b-xs bg-white px-6 pt-6 pb-12 sm:px-10">
        {stub}
      </div>
    </div>
  )
}
