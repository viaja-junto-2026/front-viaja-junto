import type { ReactNode } from 'react'
import { TicketPerforation } from './TicketPerforation'

type TicketCardProps = {
  /** Parte de cima do bilhete: marca, título e apresentação. */
  children: ReactNode
  /** Canhoto, abaixo do picote: a ação da tela. */
  stub: ReactNode
}

/**
 * Cartão em forma de cartão de embarque, grande e centralizado (telas de entrada).
 * A sombra é `drop-shadow` (e não `shadow`) para acompanhar o contorno dos furos.
 */
export function TicketCard({ children, stub }: TicketCardProps) {
  return (
    <div className="flex flex-col drop-shadow-ticket">
      <div className="flex flex-col items-center gap-5 rounded-t-xs bg-white px-6 pt-14 pb-6 text-center sm:px-10">
        {children}
      </div>
      <TicketPerforation />
      <div className="flex flex-col gap-4 rounded-b-xs bg-white px-6 pt-6 pb-12 sm:px-10">
        {stub}
      </div>
    </div>
  )
}
