import { Compass } from 'lucide-react'
import { RatingSummary } from '../../components/reviews/RatingSummary'
import { CoverPhoto } from '../../components/ui/CoverPhoto'
import { DetailHero } from '../../components/ui/DetailHero'
import { Tag } from '../../components/ui/Tag'
import { ExternalTextLink } from '../../components/ui/ExternalTextLink'
import { TextLink } from '../../components/ui/TextLink'
import { paths } from '../../routes/paths'
import type { ActivityDetails } from '../../services/activities'
import { activityTypeLabels } from '../../utils/labels'
import { DisplayTitle } from '../../components/ui/DisplayTitle'
import { LocationLine } from '../../components/ui/LocationLine'

type ActivityHeaderProps = {
  activity: ActivityDetails
}

/** Monta o texto de localização a partir do endereço, cidade e país disponíveis. */
function formatLocation(activity: ActivityDetails): string {
  return [activity.location, activity.city, activity.country].filter(Boolean).join(', ')
}

/**
 * Cabeçalho da página da atividade: foto (ou fundo bege com ícone), tipo, nome,
 * localização, nota média, quantidade de avaliações e descrição.
 */
export function ActivityHeader({ activity }: ActivityHeaderProps) {
  const locationText = formatLocation(activity)

  return (
    <DetailHero
      back={{ to: paths.destinations, label: 'Explorar destinos' }}
      media={
        <CoverPhoto
          src={activity.photoUrl}
          alt={activity.name}
          fallbackIcon={Compass}
          ratio="header"
          iconSize={56}
          loading="eager"
          className="rounded-xs"
        />
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <Tag>{activityTypeLabels[activity.type]}</Tag>
        {activity.destinationId && (
          <TextLink to={paths.destinationDetails(activity.destinationId)}>Ver destino</TextLink>
        )}
      </div>

      <DisplayTitle size="page">{activity.name}</DisplayTitle>

      {locationText && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <LocationLine>{locationText}</LocationLine>
          {activity.mapsUrl && (
            <ExternalTextLink href={activity.mapsUrl}>Ver no mapa</ExternalTextLink>
          )}
        </div>
      )}

      <RatingSummary rating={activity.averageRating} reviewCount={activity.reviewCount} />

      {activity.description && <p className="text-body-md text-gray-ink">{activity.description}</p>}
    </DetailHero>
  )
}
