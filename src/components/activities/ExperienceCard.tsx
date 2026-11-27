import { BedDouble, Bus, Compass, MapPin, Utensils, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router'
import { paths } from '../../routes/paths'
import type { Activity } from '../../services/activities'
import { activityTypeLabels, type ActivityType } from '../../utils/labels'
import { CoverPhoto } from '../ui/CoverPhoto'
import { focusRing } from '../ui/focus'
import { IconCircle } from '../ui/IconCircle'

const typeIcons: Record<ActivityType, LucideIcon> = {
  TOUR: Compass,
  FOOD: Utensils,
  LODGING: BedDouble,
  TRANSPORT: Bus,
  OTHER: MapPin,
}

type ExperienceCardProps = {
  activity: Activity
}

/** Card de experiência da home: foto, ícone do tipo sobre a borda, nome e cidade. */
export function ExperienceCard({ activity }: ExperienceCardProps) {
  const { id, name, type, city, photoUrl } = activity
  const Icon = typeIcons[type]

  return (
    <Link
      to={paths.activityDetails(id)}
      className={`group flex h-full flex-col items-center text-center ${focusRing}`}
    >
      <CoverPhoto src={photoUrl} fallbackIcon={Icon} className="rounded-xs" />
      <span className="relative -mt-6">
        <IconCircle icon={Icon} tone="white" />
      </span>
      <span className="mt-3 text-label-md text-gray-ink uppercase group-hover:text-red-ruby">
        {name}
      </span>
      <span className="mt-1 text-body-sm text-gray-dim">
        {[activityTypeLabels[type], city].filter(Boolean).join(' · ')}
      </span>
    </Link>
  )
}
