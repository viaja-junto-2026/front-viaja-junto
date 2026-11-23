import { ChevronLeft, ChevronRight, Compass } from 'lucide-react'
import { ActivityCard } from '../../components/activities/ActivityCard'
import { EmptyState } from '../../components/feedback/EmptyState'
import { LoadingSkeleton } from '../../components/feedback/LoadingSkeleton'
import { QueryState } from '../../components/feedback/QueryState'
import { Button } from '../../components/ui/Button'
import { Chip } from '../../components/ui/Chip'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { Select, type SelectOption } from '../../components/ui/Select'
import { useActivities } from '../../hooks/useActivities'
import type { ActivitySort } from '../../services/activities'
import { activityTypeLabels, type ActivityType } from '../../utils/labels'

const ACTIVITY_TYPES: ActivityType[] = ['TOUR', 'FOOD', 'LODGING', 'TRANSPORT', 'OTHER']

const MIN_RATING_OPTIONS: SelectOption[] = [
  { value: '', label: 'Qualquer nota' },
  { value: '3', label: '3+ estrelas' },
  { value: '4', label: '4+ estrelas' },
  { value: '4.5', label: '4,5+ estrelas' },
]

const SORT_OPTIONS: SelectOption[] = [
  { value: 'name', label: 'Nome (A–Z)' },
  { value: 'rating', label: 'Melhor avaliadas' },
]

type DestinationActivitiesSectionProps = {
  destinationId: string
}

/**
 * Seção de atividades do destino: filtros por tipo (Chips), nota mínima e ordenação,
 * grade responsiva de cards clicáveis e paginação.
 */
export function DestinationActivitiesSection({ destinationId }: DestinationActivitiesSectionProps) {
  const activities = useActivities({
    initialFilters: { destinationId, sort: 'name' },
    initialLimit: 9,
  })

  const { filters, meta } = activities
  const hasActiveFilters = Boolean(filters.type || filters.minRating !== undefined)
  const totalPages = meta?.totalPages
  const showPagination = (totalPages ?? 1) > 1 || activities.hasPrevious || activities.hasNext

  function handleTypeToggle(type?: ActivityType) {
    activities.setFilters({
      type: filters.type === type ? undefined : type,
    })
  }

  function handleMinRatingChange(value: string) {
    activities.setFilters({
      minRating: value ? Number(value) : undefined,
    })
  }

  function handleSortChange(value: string) {
    activities.setFilters({
      sort: (value as ActivitySort) || 'name',
    })
  }

  function clearFilters() {
    activities.setFilters({
      type: undefined,
      minRating: undefined,
    })
  }

  return (
    <section aria-label="Atividades" className="flex flex-col gap-6">
      <SectionHeader title="Atividades">
        {meta && meta.total > 0 && (
          <span className="text-body-sm text-gray-dim tabular">
            {meta.total === 1 ? '1 atividade' : `${meta.total} atividades`}
          </span>
        )}
      </SectionHeader>

      <div className="flex flex-col gap-4 rounded-lg border border-beige-sand bg-white p-4">
        <div role="group" aria-label="Filtrar por tipo" className="flex flex-wrap gap-2">
          <Chip selected={!filters.type} onClick={() => handleTypeToggle(undefined)}>
            Todos
          </Chip>
          {ACTIVITY_TYPES.map((type) => (
            <Chip
              key={type}
              selected={filters.type === type}
              onClick={() => handleTypeToggle(type)}
            >
              {activityTypeLabels[type]}
            </Chip>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:max-w-xl">
          <Select
            label="Nota mínima"
            options={MIN_RATING_OPTIONS}
            value={filters.minRating !== undefined ? String(filters.minRating) : ''}
            onChange={handleMinRatingChange}
          />
          <Select
            label="Ordenar por"
            options={SORT_OPTIONS}
            value={filters.sort ?? 'name'}
            onChange={handleSortChange}
          />
        </div>
      </div>

      <QueryState
        isLoading={activities.isLoading}
        isError={activities.isError}
        isEmpty={activities.isEmpty}
        error={activities.error}
        onRetry={() => void activities.refetch()}
        loading={<LoadingSkeleton variant="card" count={3} label="Carregando atividades" />}
        empty={
          hasActiveFilters ? (
            <EmptyState
              icon={Compass}
              title="Nenhuma atividade encontrada com esses filtros"
              description="Tente remover algum filtro para ver todas as atividades do destino."
              action={
                <Button variant="secondary" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Compass}
              title="Ainda não há atividades cadastradas"
              description="As atividades deste destino aparecerão aqui assim que forem adicionadas ao catálogo."
            />
          )
        }
      >
        <div className="flex flex-col gap-6">
          <ul aria-label="Lista de atividades" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activities.items.map((activity) => (
              <li key={activity.id}>
                <ActivityCard activity={activity} />
              </li>
            ))}
          </ul>

          {showPagination && (
            <nav
              aria-label="Paginação das atividades"
              className="flex flex-wrap items-center justify-between gap-4"
            >
              <Button
                variant="secondary"
                disabled={!activities.hasPrevious || activities.isFetching}
                leftIcon={<ChevronLeft aria-hidden="true" size={20} />}
                onClick={() => activities.setPage(activities.page - 1)}
              >
                Anterior
              </Button>
              <span aria-live="polite" className="text-body-sm text-gray-dim tabular">
                Página {activities.page}
                {totalPages ? ` de ${totalPages}` : ''}
              </span>
              <Button
                variant="secondary"
                disabled={!activities.hasNext || activities.isFetching}
                rightIcon={<ChevronRight aria-hidden="true" size={20} />}
                onClick={() => activities.setPage(activities.page + 1)}
              >
                Próxima
              </Button>
            </nav>
          )}
        </div>
      </QueryState>
    </section>
  )
}
