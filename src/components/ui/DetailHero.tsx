import type { ReactNode } from 'react'
import { Container } from '../layout/Container'
import { BackLink } from './BackLink'

type DetailHeroProps = {
  back: { to: string; label: string }
  /** Foto (ou o ícone de reserva) do item, ao lado do texto. */
  media: ReactNode
  /** Texto do cabeçalho: selo, título, localização, nota e descrição. */
  children: ReactNode
}

/** Topo branco das páginas de detalhe: texto à esquerda e foto à direita. */
export function DetailHero({ back, media, children }: DetailHeroProps) {
  return (
    <article className="bg-white">
      <Container className="flex flex-col gap-6 py-8 lg:py-12">
        <BackLink to={back.to}>{back.label}</BackLink>
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
          <div className="lg:order-last lg:col-span-5">{media}</div>
          <div className="flex flex-col gap-4 lg:col-span-7">{children}</div>
        </div>
      </Container>
    </article>
  )
}
