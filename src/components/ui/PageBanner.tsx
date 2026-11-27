import type { ReactNode } from 'react'
import { Container } from '../layout/Container'
import { CompassDivider } from './CompassDivider'
import { FlightRoute } from './FlightRoute'
import { DisplayTitle } from './DisplayTitle'

type PageBannerProps = {
  /** Linha pequena acima do título. */
  eyebrow: string
  /** Título da página (vira o `h1`). */
  title: string
  description: string
  /** Informação extra abaixo da descrição, por exemplo a contagem de resultados. */
  children?: ReactNode
}

/** Topo de uma listagem: branco e centralizado, no mesmo desenho dos títulos da home. */
export function PageBanner({ eyebrow, title, description, children }: PageBannerProps) {
  return (
    <header className="bg-white">
      <Container className="relative flex flex-col items-center gap-3 pt-10 pb-10 text-center">
        <FlightRoute />
        <p className="text-label-overline text-red-ruby uppercase">{eyebrow}</p>
        <DisplayTitle size="page">{title}</DisplayTitle>
        <CompassDivider />
        <p className="max-w-lg text-body-md text-gray-dim">{description}</p>
        {children && <div className="text-body-sm text-gray-dim">{children}</div>}
      </Container>
    </header>
  )
}
