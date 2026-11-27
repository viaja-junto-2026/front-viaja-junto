import { Compass, MapPin } from 'lucide-react'
import { Link } from 'react-router'
import { paths } from '../../routes/paths'
import type { Activity } from '../../services/activities'
import { formatReviewCount } from '../../utils/format'
import { activityTypeLabels } from '../../utils/labels'
import { RatingStars } from '../reviews/RatingStars'
import { FlushCard } from '../ui/Card'
import { CoverPhoto } from '../ui/CoverPhoto'
import { Tag } from '../ui/Tag'
import { focusRing } from '../ui/focus'

type ActivityCardProps = {
  activity: Activity
}

/**
 * Card clicável de uma atividade do catálogo: foto (ou fundo bege com ícone), tipo,
 * nome, localização, descrição resumida e nota média. Leva para `/activities/:id`.
 * No celular é pequeno (dois por linha) e não mostra a descrição.
 */
export function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <FlushCard
      as="article"
      interactive
      className="flex h-full flex-col overflow-hidden border border-beige-sand"
    >
      <Link
        to={paths.activityDetails(activity.id)}
        className={`group flex h-full flex-col rounded-xs ${focusRing}`}
      >
        <CoverPhoto src={activity.photoUrl} fallbackIcon={Compass} ratio="video" />

        <div className="flex flex-1 flex-col gap-2 p-3 sm:gap-3 sm:p-4">
          <Tag>{activityTypeLabels[activity.type]}</Tag>

          <h3 className="font-display text-title-md font-normal text-brown-espresso sm:text-headline-sm">
            {activity.name}
          </h3>

          {activity.location && (
            <p className="flex items-center gap-1.5 text-body-sm text-gray-dim">
              <MapPin aria-hidden="true" size={16} className="shrink-0 text-red-ruby" />
              <span className="truncate">{activity.location}</span>
            </p>
          )}

          {activity.description && (
            <p className="hidden text-body-sm text-gray-ink sm:line-clamp-2">
              {activity.description}
            </p>
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
    </FlushCard>
  )
}
