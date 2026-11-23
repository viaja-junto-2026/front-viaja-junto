import { ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react'
import { formatDate } from '../../utils/format'
import { EmptyState } from '../feedback/EmptyState'
import { LoadingSkeleton } from '../feedback/LoadingSkeleton'
import { QueryState } from '../feedback/QueryState'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { CardCompact } from '../ui/Card'
import { RatingStars } from './RatingStars'

const FALLBACK_AUTHOR = 'Viajante'

/** Item mínimo para exibir uma avaliação na interface (apenas nome do autor, nunca e-mail). */
export type ReviewListItem = {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  authorName?: string | null
}

type ReviewListProps = {
  items: ReviewListItem[]
  isLoading: boolean
  /** Indica recarregamento ou troca de página em andamento. */
  isFetching?: boolean
  isError: boolean
  error?: unknown
  onRetry?: () => void
  page: number
  totalPages?: number
  hasPrevious: boolean
  hasNext: boolean
  onPageChange: (page: number) => void
  emptyTitle?: string
  emptyDescription?: string
}

/**
 * Lista paginada de avaliações reutilizável (páginas de atividade e de destino).
 * Trata carregando, erro, estado vazio e navegação entre páginas.
 */
export function ReviewList({
  items,
  isLoading,
  isFetching = false,
  isError,
  error,
  onRetry,
  page,
  totalPages,
  hasPrevious,
  hasNext,
  onPageChange,
  emptyTitle = 'Ainda não há avaliações',
  emptyDescription = 'As avaliações de quem já visitou aparecerão aqui.',
}: ReviewListProps) {
  const showPagination = (totalPages ?? 1) > 1 || hasPrevious || hasNext

  return (
    <QueryState
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && !isError && items.length === 0}
      error={error}
      onRetry={onRetry}
      loading={<LoadingSkeleton variant="list" count={3} label="Carregando avaliações" />}
      empty={<EmptyState icon={MessageSquare} title={emptyTitle} description={emptyDescription} />}
    >
      <div className="flex flex-col gap-6">
        <ul aria-label="Lista de avaliações" className="flex flex-col gap-4">
          {items.map((review) => {
            const authorName = review.authorName?.trim() || FALLBACK_AUTHOR
            return (
              <CardCompact key={review.id} as="li" className="border border-beige-sand">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={authorName} size="sm" />
                    <div className="flex flex-col">
                      <span className="text-title-md text-gray-ink">{authorName}</span>
                      <time dateTime={review.createdAt} className="text-body-sm text-gray-dim">
                        {formatDate(review.createdAt)}
                      </time>
                    </div>
                  </div>
                  <RatingStars rating={review.rating} size="sm" />
                </div>
                {review.comment && (
                  <p className="mt-3 text-body-md text-gray-ink">{review.comment}</p>
                )}
              </CardCompact>
            )
          })}
        </ul>

        {showPagination && (
          <nav
            aria-label="Paginação das avaliações"
            className="flex flex-wrap items-center justify-between gap-4"
          >
            <Button
              variant="secondary"
              disabled={!hasPrevious || isFetching}
              leftIcon={<ChevronLeft aria-hidden="true" size={20} />}
              onClick={() => onPageChange(page - 1)}
            >
              Anterior
            </Button>
            <span aria-live="polite" className="text-body-sm text-gray-dim tabular">
              Página {page}
              {totalPages ? ` de ${totalPages}` : ''}
            </span>
            <Button
              variant="secondary"
              disabled={!hasNext || isFetching}
              rightIcon={<ChevronRight aria-hidden="true" size={20} />}
              onClick={() => onPageChange(page + 1)}
            >
              Próxima
            </Button>
          </nav>
        )}
      </div>
    </QueryState>
  )
}
