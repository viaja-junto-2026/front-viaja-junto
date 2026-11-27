import { MapPin } from 'lucide-react'
import { paths } from '../../routes/paths'
import type { Destination } from '../../services/destinations'
import { formatReviewCount } from '../../utils/format'
import { RatingStars } from '../reviews/RatingStars'
import { ButtonLink } from '../ui/ButtonLink'
import { CoverPhoto } from '../ui/CoverPhoto'

type DestinationShowcaseCardProps = {
  destination: Destination
}

/** Card editorial de destino, em destaque na home: foto, nome em serifa, resumo e nota. */
export function DestinationShowcaseCard({ destination }: DestinationShowcaseCardProps) {
  const { id, name, country, description, photoUrl, averageRating, reviewCount } = destination

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xs border border-beige-sand bg-white">
      <CoverPhoto src={photoUrl} fallbackIcon={MapPin} />
      <div className="flex flex-1 flex-col items-center gap-3 p-6 text-center">
        <h3 className="font-display text-headline-md font-normal text-gray-ink">{name}</h3>
        {country && <p className="text-label-sm text-red-ruby uppercase">{country}</p>}
        {description && <p className="line-clamp-2 text-body-sm text-gray-dim">{description}</p>}
        {averageRating !== null && (
          <p className="flex flex-wrap items-center justify-center gap-2">
            <RatingStars rating={averageRating} size="sm" showValue />
            <span className="text-body-sm text-gray-dim">({formatReviewCount(reviewCount)})</span>
          </p>
        )}
        <div className="mt-auto pt-2">
          <ButtonLink
            to={paths.destinationDetails(id)}
            variant="solid"
            aria-label={`Ver detalhes de ${name}`}
          >
            Ver detalhes
          </ButtonLink>
        </div>
      </div>
    </article>
  )
}
