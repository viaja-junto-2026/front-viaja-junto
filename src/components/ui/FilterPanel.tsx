import type { ReactNode } from 'react'

/** Caixa branca, de cantos retos, que agrupa a busca e os filtros de uma lista. */
export function FilterPanel({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-xs border border-beige-sand bg-white p-4 sm:p-6">
      {children}
    </div>
  )
}
