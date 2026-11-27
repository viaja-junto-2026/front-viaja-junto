import type { ReactNode } from 'react'
import { DisplayTitle } from './DisplayTitle'

type SectionHeaderProps = {
  title: string
  /** Links ou botões à direita do título (por exemplo, "Ver todas"). */
  children?: ReactNode
}

/** Cabeçalho de uma faixa de conteúdo: título em serifa marrom e ações à direita. */
export function SectionHeader({ title, children }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <DisplayTitle as="h2">{title}</DisplayTitle>
      {children && <div className="flex items-center gap-4">{children}</div>}
    </div>
  )
}
