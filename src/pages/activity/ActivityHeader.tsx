import { Compass, MapPin } from 'lucide-react'
import { RatingStars } from '../../components/reviews/RatingStars'
import { Card } from '../../components/ui/Card'
import { CoverPhoto } from '../../components/ui/CoverPhoto'
import { Tag } from '../../components/ui/Tag'
import { ExternalTextLink } from '../../components/ui/ExternalTextLink'
import { TextLink } from '../../components/ui/TextLink'
import { paths } from '../../routes/paths'
import type { ActivityDetails } from '../../services/activities'
import { formatReviewCount } from '../../utils/format'
import { activityTypeLabels } from '../../utils/labels'

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
    <Card as="article" className="grid gap-6 border border-beige-sand lg:grid-cols-12 lg:gap-8">
      <CoverPhoto
        src={activity.photoUrl}
        alt={activity.name}
        fallbackIcon={Compass}
        ratio="header"
        iconSize={56}
        loading="eager"
        className="rounded-lg lg:col-span-5"
      />

      <div className="flex flex-col justify-center gap-4 lg:col-span-7">
        <div className="flex flex-wrap items-center gap-3">
          <Tag>{activityTypeLabels[activity.type]}</Tag>
          {activity.destinationId && (
            <TextLink to={paths.destinationDetails(activity.destinationId)}>Ver destino</TextLink>
          )}
        </div>

        <h1 className="font-heading text-headline-md text-red-burgundy lg:text-headline-lg">
          {activity.name}
        </h1>

        {locationText && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="flex items-center gap-2 text-body-md text-gray-dim">
              <MapPin aria-hidden="true" size={20} className="shrink-0 text-red-ruby" />
              <span>{locationText}</span>
            </p>
            {activity.mapsUrl && (
              <ExternalTextLink href={activity.mapsUrl}>Ver no mapa</ExternalTextLink>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {activity.averageRating !== null ? (
            <>
              <RatingStars rating={activity.averageRating} size="md" showValue />
              <span className="text-body-sm text-gray-dim tabular">
                ({formatReviewCount(activity.reviewCount)})
              </span>
            </>
          ) : (
            <span className="text-body-sm text-gray-dim">Ainda sem nota média</span>
          )}
        </div>

        {activity.description && (
          <p className="text-body-md text-gray-ink">{activity.description}</p>
        )}
      </div>
    </Card>
  )
}
