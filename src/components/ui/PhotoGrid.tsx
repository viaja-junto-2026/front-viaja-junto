import type { ReactNode } from 'react'

type PhotoGridProps = {
  /** Nome da lista para leitores de tela, por exemplo "Lista de destinos". */
  label?: string
  /** Os itens da grade, cada um em um `li`. */
  children: ReactNode
}

/**
 * Grade de cards de foto: dois por linha no celular e no tablet, três no desktop. No celular
 * todas as fileiras têm a mesma altura, a do maior card (um nome em duas linhas, por exemplo).
 */
export function PhotoGrid({ label, children }: PhotoGridProps) {
  return (
    <ul
      aria-label={label}
      className="grid auto-rows-fr grid-cols-2 gap-3 sm:auto-rows-auto sm:gap-6 lg:grid-cols-3"
    >
      {children}
    </ul>
  )
}
