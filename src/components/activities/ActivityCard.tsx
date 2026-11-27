import { Compass, MapPin } from 'lucide-react'
import { Link } from 'react-router'
import { paths } from '../../routes/paths'
import type { Activity } from '../../services/activities'
import { formatReviewCount } from '../../utils/format'
import { activityTypeLabels } from '../../utils/labels'
import { RatingStars } from '../reviews/RatingStars'
import { Card } from '../ui/Card'
import { CoverPhoto } from '../ui/CoverPhoto'
import { Tag } from '../ui/Tag'
import { focusRing } from '../ui/focus'

type ActivityCardProps = {
  activity: Activity
}

/**
 * Card clicável de uma atividade do catálogo: foto (ou fundo bege com ícone), tipo,
 * nome, localização, descrição resumida e nota média. Leva para `/activities/:id`.
 */
export function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <Card
      as="article"
      interactive
      className="flex h-full flex-col overflow-hidden border border-beige-sand p-0"
    >
      <Link
        to={paths.activityDetails(activity.id)}
        className={`group flex h-full flex-col rounded-lg ${focusRing}`}
      >
        <CoverPhoto src={activity.photoUrl} fallbackIcon={Compass} ratio="video" />

        <div className="flex flex-1 flex-col gap-3 p-4">
          <Tag>{activityTypeLabels[activity.type]}</Tag>

          <h3 className="font-heading text-title-md text-red-burgundy">{activity.name}</h3>

          {activity.location && (
            <p className="flex items-center gap-1.5 text-body-sm text-gray-dim">
              <MapPin aria-hidden="true" size={16} className="shrink-0 text-red-ruby" />
              <span className="truncate">{activity.location}</span>
            </p>
          )}

          {activity.description && (
            <p className="line-clamp-2 text-body-sm text-gray-ink">{activity.description}</p>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
            {activity.averageRating !== null ? (
              <>
                <RatingStars rating={activity.averageRating} size="sm" showValue />
                <span className="text-body-sm text-gray-dim tabular">
                  ({formatReviewCount(activity.reviewCount)})
                </span>
              </>
            ) : (
              <span className="text-body-sm text-gray-dim">Sem avaliações</span>
            )}
          </div>
        </div>
      </Link>
    </Card>
  )
}
