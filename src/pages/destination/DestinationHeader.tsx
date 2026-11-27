import { MapPin } from 'lucide-react'
import { RatingSummary } from '../../components/reviews/RatingSummary'
import { CoverPhoto } from '../../components/ui/CoverPhoto'
import { DetailHero } from '../../components/ui/DetailHero'
import { Tag } from '../../components/ui/Tag'
import { paths } from '../../routes/paths'
import type { DestinationDetails } from '../../services/destinations'
import { destinationCategoryLabels } from '../../utils/labels'
import { DisplayTitle } from '../../components/ui/DisplayTitle'
import { LocationLine } from '../../components/ui/LocationLine'

type DestinationHeaderProps = {
  destination: DestinationDetails
}

/**
 * Cabeçalho da página do destino: foto (ou fundo bege com ícone), categoria,
 * nome, país, nota média, quantidade de avaliações e descrição.
 */
export function DestinationHeader({ destination }: DestinationHeaderProps) {
  return (
    <DetailHero
      back={{ to: paths.destinations, label: 'Explorar destinos' }}
      media={
        <CoverPhoto
          src={destination.photoUrl}
          alt={destination.name}
          fallbackIcon={MapPin}
          ratio="header"
          iconSize={56}
          loading="eager"
          className="rounded-xs"
        />
      }
    >
      {destination.category && <Tag>{destinationCategoryLabels[destination.category]}</Tag>}

      <DisplayTitle size="page">{destination.name}</DisplayTitle>

      {destination.country && <LocationLine>{destination.country}</LocationLine>}

      <RatingSummary rating={destination.averageRating} reviewCount={destination.reviewCount} />

      {destination.description && (
        <p className="text-body-md text-gray-ink">{destination.description}</p>
      )}
    </DetailHero>
  )
}
