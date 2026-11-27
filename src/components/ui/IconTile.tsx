import type { LucideIcon } from 'lucide-react'

/**
 * Ícone branco em um quadrado Rubi com os cantos do app (`rounded-xs`). Marca o tipo de
 * cada linha de uma lista, como as categorias do orçamento.
 */
export function IconTile({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="flex size-12 shrink-0 items-center justify-center rounded-xs bg-red-ruby text-white">
      <Icon aria-hidden="true" size={24} />
    </span>
  )
}
