import type { ReactNode } from 'react'

type SectionHeaderProps = {
  title: string
  /** Links ou botões à direita do título (por exemplo, "Ver todas"). */
  children?: ReactNode
}

/** Cabeçalho de uma faixa de conteúdo: título em Bordô e ações à direita. */
export function SectionHeader({ title, children }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="font-heading text-headline-md text-red-burgundy">{title}</h2>
      {children && <div className="flex items-center gap-4">{children}</div>}
    </div>
  )
}
