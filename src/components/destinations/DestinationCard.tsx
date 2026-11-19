import { MapPin, Star } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { focusRing } from '../ui/focus'
import { paths } from '../../routes/paths'
import type { Destination } from '../../services/destinations'
import { formatRating } from '../../utils/format'

type DestinationCardProps = {
  destination: Destination
  className?: string
}

/**
 * Card de foto de um destino do catálogo: foto cobrindo o card, nome e país sobre o véu
 * Bordô e a nota média no canto. Sem foto (ou se ela falhar), mostra o bege com o ícone
 * de local, nunca uma imagem genérica. O card inteiro leva para a página do destino.
 */
export function DestinationCard({ destination, className }: DestinationCardProps) {
  const { id, name, country, photoUrl, averageRating, reviewCount } = destination
  const [photoFailed, setPhotoFailed] = useState(false)
  const showPhoto = Boolean(photoUrl) && !photoFailed

  return (
    <Link
      to={paths.destinationDetails(id)}
      className={`group relative block aspect-4/5 overflow-hidden rounded-lg bg-beige-sand transition-shadow hover:shadow-lg ${focusRing} ${className ?? ''}`.trim()}
    >
      {showPhoto ? (
        <img
          src={photoUrl ?? undefined}
          alt=""
          loading="lazy"
          onError={() => setPhotoFailed(true)}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <span className="flex size-full items-center justify-center text-red-ruby">
          <MapPin aria-hidden="true" size={48} />
        </span>
      )}

      {averageRating !== null && (
        <span
          role="img"
          aria-label={`Nota ${formatRating(averageRating)} de 5, ${reviewCount} ${
            reviewCount === 1 ? 'avaliação' : 'avaliações'
          }`}
          className="absolute right-3 bottom-3 z-10 flex items-center gap-1 rounded-sm bg-white px-2 py-1 text-label-md text-gray-ink"
        >
          <Star aria-hidden="true" size={16} className="text-red-ruby" fill="currentColor" />
          <span aria-hidden="true" className="tabular">
            {formatRating(averageRating)}
          </span>
        </span>
      )}

      <span className="absolute inset-x-0 bottom-0 flex flex-col bg-scrim-burgundy p-4 pr-20 text-white">
        <span className="text-title-md">{name}</span>
        {country && <span className="text-body-sm">{country}</span>}
      </span>
    </Link>
  )
}
