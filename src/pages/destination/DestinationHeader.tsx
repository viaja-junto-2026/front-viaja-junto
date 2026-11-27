import { MapPin } from 'lucide-react'
import { RatingStars } from '../../components/reviews/RatingStars'
import { Card } from '../../components/ui/Card'
import { CoverPhoto } from '../../components/ui/CoverPhoto'
import { Tag } from '../../components/ui/Tag'
import type { DestinationDetails } from '../../services/destinations'
import { formatReviewCount } from '../../utils/format'
import { destinationCategoryLabels } from '../../utils/labels'

type DestinationHeaderProps = {
  destination: DestinationDetails
}

/**
 * Cabeçalho da página do destino: foto (ou fundo bege com ícone), categoria,
 * nome, país, nota média, quantidade de avaliações e descrição.
 */
export function DestinationHeader({ destination }: DestinationHeaderProps) {
  return (
    <Card as="article" className="grid gap-6 border border-beige-sand lg:grid-cols-12 lg:gap-8">
      <CoverPhoto
        src={destination.photoUrl}
        alt={destination.name}
        fallbackIcon={MapPin}
        ratio="header"
        iconSize={56}
        loading="eager"
        className="rounded-lg lg:col-span-5"
      />

      <div className="flex flex-col justify-center gap-4 lg:col-span-7">
        {destination.category && <Tag>{destinationCategoryLabels[destination.category]}</Tag>}

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
