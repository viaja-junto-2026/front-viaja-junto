import type { ReactNode } from 'react'
import photo from '../../assets/hero-tokyo.webp'
import { CurvedEdge } from '../ui/CurvedEdge'

/**
 * Moldura das telas de entrada (login e retorno do login), fora do layout principal.
 * No desktop mostra a foto com véu marrom ao lado, com a borda em curva; no celular, só o conteúdo.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen bg-beige-light lg:grid-cols-2">
      <div className="relative hidden bg-brown-espresso lg:block">
        <img src={photo} alt="" className="absolute inset-0 size-full object-cover" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-brown-espresso via-brown-espresso/60 to-transparent"
        />
        <div className="relative flex h-full flex-col justify-end gap-3 p-12 text-white">
          <p className="text-label-overline text-beige-sand uppercase">
            Roteiro. Orçamento. Companhia.
          </p>
          <p className="font-display text-display-hero-mobile">Sua viagem começa aqui.</p>
        </div>
        <CurvedEdge />
      </div>
      <div className="flex flex-col items-center justify-center px-4 py-10">
        <div className="flex w-full max-w-md flex-col gap-6">{children}</div>
      </div>
    </main>
  )
}
