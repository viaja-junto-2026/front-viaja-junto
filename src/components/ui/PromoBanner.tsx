import type { ReactNode } from 'react'
import { Container } from '../layout/Container'

type PromoBannerProps = {
  title: string
  text: string
  /** Foto de fundo (decorativa). */
  image: string
  /** Botão ou link da chamada. */
  action: ReactNode
}

/** Faixa de chamada com foto e véu Bordô da esquerda para a direita. */
export function PromoBanner({ title, text, image, action }: PromoBannerProps) {
  return (
    <section aria-label={title} className="relative overflow-hidden bg-red-burgundy">
      <img
        src={image}
        alt=""
        loading="lazy"
        className="absolute inset-0 size-full object-cover object-bottom"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-r from-red-burgundy via-red-burgundy/80 to-red-burgundy/20"
      />
      <Container className="relative py-16">
        <div className="flex max-w-md flex-col items-start gap-4">
          <h2 className="font-display text-headline-lg font-normal text-white">{title}</h2>
          <p className="text-body-md text-white">{text}</p>
          {action}
        </div>
      </Container>
    </section>
  )
}
