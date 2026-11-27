import type { ReactNode } from 'react'

/**
 * Caixa marrom, de cantos retos, que agrupa a busca e os filtros de uma lista
 * (a mesma da busca da home). Os campos dentro dela usam `inverted`.
 */
export function FilterPanel({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-xs bg-brown-espresso p-4 shadow-lg sm:p-6">
      {children}
    </div>
  )
}
