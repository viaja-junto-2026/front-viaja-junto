import { MapPin } from 'lucide-react'
import { useState } from 'react'
import { RatingStars } from '../../components/reviews/RatingStars'
import { Card } from '../../components/ui/Card'
import type { DestinationDetails } from '../../services/destinations'
import { destinationCategoryLabels } from '../../utils/labels'

type DestinationHeaderProps = {
  destination: DestinationDetails
}

/** Texto de contagem de avaliações no singular ou plural. */
function formatReviewCount(count: number): string {
  return count === 1 ? '1 avaliação' : `${count} avaliações`
}

/**
 * Cabeçalho da página do destino: foto (ou fundo bege com ícone), categoria,
 * nome, país, nota média, quantidade de avaliações e descrição.
 */
export function DestinationHeader({ destination }: DestinationHeaderProps) {
  const [photoFailed, setPhotoFailed] = useState(false)
  const showPhoto = Boolean(destination.photoUrl) && !photoFailed

  return (
    <Card as="article" className="grid gap-6 border border-beige-sand lg:grid-cols-12 lg:gap-8">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-beige-sand lg:col-span-5 lg:aspect-4/3">
        {showPhoto ? (
          <img
            src={destination.photoUrl ?? undefined}
            alt={destination.name}
            onError={() => setPhotoFailed(true)}
            className="size-full object-cover"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-red-ruby">
            <MapPin aria-hidden="true" size={56} />
          </span>
        )}
      </div>

      <div className="flex flex-col justify-center gap-4 lg:col-span-7">
        {destination.category && (
          <span className="inline-flex w-fit items-center rounded-xs bg-beige-sand px-3 py-1 text-label-sm uppercase text-gray-ink">
            {destinationCategoryLabels[destination.category]}
          </span>
        )}

        <h1 className="font-heading text-headline-md text-red-burgundy lg:text-headline-lg">
          {destination.name}
        </h1>

        {destination.country && (
          <p className="flex items-center gap-2 text-body-md text-gray-dim">
            <MapPin aria-hidden="true" size={20} className="shrink-0 text-red-ruby" />
            <span>{destination.country}</span>
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {destination.averageRating !== null ? (
            <>
              <RatingStars rating={destination.averageRating} size="md" showValue />
              <span className="text-body-sm text-gray-dim tabular">
                ({formatReviewCount(destination.reviewCount)})
              </span>
            </>
          ) : (
            <span className="text-body-sm text-gray-dim">Ainda sem nota média</span>
          )}
        </div>

        {destination.description && (
          <p className="text-body-md text-gray-ink">{destination.description}</p>
        )}
      </div>
    </Card>
  )
}
