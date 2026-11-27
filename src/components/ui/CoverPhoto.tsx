import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'

type CoverPhotoProps = {
  /** Endereço da foto; sem ele (ou se falhar) aparece o ícone no fundo bege. */
  src: string | null
  fallbackIcon: LucideIcon
  className?: string
}

/** Foto de capa decorativa de um card. Nunca usa imagem genérica no lugar da que falta. */
export function CoverPhoto({ src, fallbackIcon: Icon, className }: CoverPhotoProps) {
  const [failed, setFailed] = useState(false)

  return (
    <div className={`aspect-4/3 w-full overflow-hidden bg-beige-sand ${className ?? ''}`.trim()}>
      {src && !failed ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <span className="flex size-full items-center justify-center text-red-ruby">
          <Icon aria-hidden="true" size={40} strokeWidth={1.25} />
        </span>
      )}
    </div>
  )
}
