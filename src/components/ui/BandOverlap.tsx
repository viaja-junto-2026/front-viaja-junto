import type { ReactNode } from 'react'
import { Container } from '../layout/Container'

/**
 * Faz o fundo branco do topo continuar até a metade do bloco seguinte (a caixa de filtros),
 * qualquer que seja a altura dele no celular ou no desktop.
 */
export function BandOverlap({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {/* Começa 1 px acima: em posições fracionadas, o fundo da página vazaria na emenda. */}
      <div aria-hidden="true" className="absolute inset-x-0 -top-px bottom-1/2 bg-white" />
      <Container className="relative">{children}</Container>
    </div>
  )
}
