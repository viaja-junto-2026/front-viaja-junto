import type { ReactNode } from 'react'

type ContainerProps = {
  children: ReactNode
  className?: string
}

/**
 * Centraliza o conteúdo na largura máxima (1200 px), com as margens de 16, 24 e 32 px.
 * Use dentro das telas de largura total, em que cada faixa tem o seu fundo.
 */
export function Container({ children, className }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-content px-4 sm:px-6 lg:px-8 ${className ?? ''}`.trim()}>
      {children}
    </div>
  )
}
