import { Compass, ExternalLink, MapPin } from 'lucide-react'
import { useState } from 'react'
import { RatingStars } from '../../components/reviews/RatingStars'
import { Card } from '../../components/ui/Card'
import { TextLink } from '../../components/ui/TextLink'
import { focusRing } from '../../components/ui/focus'
import { paths } from '../../routes/paths'
import type { ActivityDetails } from '../../services/activities'
import { activityTypeLabels } from '../../utils/labels'

type ActivityHeaderProps = {
  activity: ActivityDetails
}

/** Monta o texto de localização a partir do endereço, cidade e país disponíveis. */
function formatLocation(activity: ActivityDetails): string {
  return [activity.location, activity.city, activity.country].filter(Boolean).join(', ')
}

/** Texto de contagem de avaliações no singular ou plural. */
function formatReviewCount(count: number): string {
  return count === 1 ? '1 avaliação' : `${count} avaliações`
}

/**
 * Cabeçalho da página da atividade: foto (ou fundo bege com ícone), tipo, nome,
 * localização, nota média, quantidade de avaliações e descrição.
 */
export function ActivityHeader({ activity }: ActivityHeaderProps) {
  const [photoFailed, setPhotoFailed] = useState(false)
  const showPhoto = Boolean(activity.photoUrl) && !photoFailed
  const locationText = formatLocation(activity)

  return (
    <Card as="article" className="grid gap-6 border border-beige-sand lg:grid-cols-12 lg:gap-8">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-beige-sand lg:col-span-5 lg:aspect-4/3">
        {showPhoto ? (
          <img
            src={activity.photoUrl ?? undefined}
            alt={activity.name}
            onError={() => setPhotoFailed(true)}
            className="size-full object-cover"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-red-ruby">
            <Compass aria-hidden="true" size={56} />
          </span>
        )}
      </div>

      <div className="flex flex-col justify-center gap-4 lg:col-span-7">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center rounded-xs bg-beige-sand px-3 py-1 text-label-sm uppercase text-gray-ink">
            {activityTypeLabels[activity.type]}
          </span>
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
              <a
                href={activity.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1 rounded-xs text-label-md text-red-burgundy underline transition-colors hover:text-red-ruby ${focusRing}`}
              >
                <span>Ver no mapa</span>
                <ExternalLink aria-hidden="true" size={16} />
              </a>
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
