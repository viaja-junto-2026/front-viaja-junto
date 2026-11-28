import { MapPin } from 'lucide-react'
import { Link } from 'react-router'
import { paths } from '../../routes/paths'
import type { Destination } from '../../services/destinations'
import { formatReviewCount } from '../../utils/format'
import { RatingStars } from '../reviews/RatingStars'
import { ButtonLink } from '../ui/ButtonLink'
import { FlushCard } from '../ui/Card'
import { CoverPhoto } from '../ui/CoverPhoto'
import { focusRing } from '../ui/focus'

type DestinationShowcaseCardProps = {
  destination: Destination
}

/**
 * Card editorial de destino, usado na home e no catálogo. No celular é pequeno (cabem dois
 * por linha), sem descrição nem botão; do tablet em diante mostra tudo. Em qualquer tela o
 * cartão inteiro é clicável.
 */
export function DestinationShowcaseCard({ destination }: DestinationShowcaseCardProps) {
  const { id, name, country, description, photoUrl, averageRating, reviewCount } = destination

  return (
    <FlushCard
      as="article"
      interactive
      className="relative flex h-full flex-col overflow-hidden border border-beige-sand"
    >
      <CoverPhoto src={photoUrl} fallbackIcon={MapPin} />
      <div className="flex flex-1 flex-col items-center gap-1 p-3 text-center sm:gap-3 sm:p-6">
        <h3 className="font-display text-headline-sm font-normal text-brown-espresso sm:text-headline-md">
          {/* O `after` estica a área de clique do link pelo cartão inteiro. */}
          <Link
            to={paths.destinationDetails(id)}
            className={`rounded-xs after:absolute after:inset-0 ${focusRing}`}
          >
            {name}
          </Link>
        </h3>
        {country && <p className="text-label-sm text-red-ruby uppercase">{country}</p>}
        {description && (
          <p className="hidden text-body-sm text-gray-dim sm:line-clamp-2">{description}</p>
        )}
        {/* No celular o espaço da nota existe mesmo sem ela, para o cartão não encolher. */}
        <div className={`min-h-11 ${averageRating === null ? 'sm:hidden' : 'sm:min-h-0'}`}>
          {averageRating !== null && (
            <p className="flex flex-wrap items-center justify-center gap-x-2">
              <RatingStars rating={averageRating} size="sm" showValue />
              <span className="text-body-sm text-gray-dim">({formatReviewCount(reviewCount)})</span>
            </p>
          )}
        </div>
        <div className="relative z-10 mt-auto hidden pt-2 sm:block">
          {/* O nome já é o link para leitores de tela e teclado: o botão é um atalho visual. */}
          <ButtonLink
            to={paths.destinationDetails(id)}
            variant="solid"
            aria-label={`Ver detalhes de ${name}`}
            aria-hidden
            tabIndex={-1}
          >
            Ver detalhes
          </ButtonLink>
        </div>
      </div>
    </FlushCard>
  )
}
