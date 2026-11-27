import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'

type CoverRatio = 'landscape' | 'video' | 'header'

const ratioStyles: Record<CoverRatio, string> = {
  landscape: 'aspect-4/3',
  video: 'aspect-video',
  /** Cabeçalho de página: larga no celular e 4:3 no desktop. */
  header: 'aspect-video lg:aspect-4/3',
}

type CoverPhotoProps = {
  /** Endereço da foto; sem ele (ou se falhar) aparece o ícone no fundo bege. */
  src: string | null
  fallbackIcon: LucideIcon
  /** Texto alternativo; vazio quando a foto é decorativa (o nome já está ao lado). */
  alt?: string
  ratio?: CoverRatio
  /** Tamanho do ícone usado quando não há foto. */
  iconSize?: number
  /** `eager` para a foto principal da página. */
  loading?: 'lazy' | 'eager'
  className?: string
}

/** Foto de capa de um card ou cabeçalho. Nunca usa imagem genérica no lugar da que falta. */
export function CoverPhoto({
  src,
  fallbackIcon: Icon,
  alt = '',
  ratio = 'landscape',
  iconSize = 40,
  loading = 'lazy',
  className,
}: CoverPhotoProps) {
  const [failed, setFailed] = useState(false)

  return (
    <div
      className={`w-full overflow-hidden bg-beige-sand ${ratioStyles[ratio]} ${className ?? ''}`.trim()}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={alt}
          loading={loading}
          onError={() => setFailed(true)}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <span className="flex size-full items-center justify-center text-red-ruby">
          <Icon aria-hidden="true" size={iconSize} strokeWidth={1.25} />
        </span>
      )}
    </div>
  )
}
