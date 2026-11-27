import type { ReactNode } from 'react'

const sizes = {
  /** Títulos de seção, mensagens e páginas simples. */
  section: 'text-headline-lg',
  /** Título principal das telas públicas e do login. */
  page: 'text-display-hero-mobile',
}

type DisplayTitleProps = {
  as?: 'h1' | 'h2'
  size?: keyof typeof sizes
  children: ReactNode
}

/** Título em serifa marrom. É o único lugar que define esse estilo. */
export function DisplayTitle({
  as: Heading = 'h1',
  size = 'section',
  children,
}: DisplayTitleProps) {
  return (
    <Heading className={`font-display font-normal text-brown-espresso ${sizes[size]}`}>
      {children}
    </Heading>
  )
}
