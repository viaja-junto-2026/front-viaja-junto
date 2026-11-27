import type { ReactNode } from 'react'

/** Selo de categoria ou tipo (somente leitura). Para filtros clicáveis, use `Chip`. */
export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex w-fit items-center rounded-xs bg-beige-sand px-3 py-1 text-label-sm text-gray-ink uppercase">
      {children}
    </span>
  )
}
