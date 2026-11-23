import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { DestinationCard } from '../components/destinations/DestinationCard'
import { EmptyState } from '../components/feedback/EmptyState'
import { LoadingSkeleton } from '../components/feedback/LoadingSkeleton'
import { QueryState } from '../components/feedback/QueryState'
import { Button } from '../components/ui/Button'
import { useDestinations } from '../hooks/useDestinations'
import { DestinationsFilters } from './destinations/DestinationsFilters'

/** Tela pública do catálogo de destinos (`/destinations`), com busca, filtros na URL e paginação. */
export default function DestinationsPage() {
  const destinations = useDestinations({ limit: 12 })
  const totalPages = destinations.meta?.totalPages
  const total = destinations.meta?.total ?? 0
  const showPagination = (totalPages ?? 1) > 1 || destinations.hasPrevious || destinations.hasNext

  return (
    <div className="flex flex-col gap-8 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-headline-md text-red-burgundy lg:text-headline-lg">
            Destinos
          </h1>
          <p className="text-body-md text-gray-dim">
            Descubra cidades, praias e lugares bem avaliados para a sua próxima viagem.
          </p>
        </div>

        {total > 0 && (
          <span className="text-body-sm text-gray-dim tabular">
            {total === 1 ? '1 destino encontrado' : `${total} destinos encontrados`}
          </span>
        )}
      </header>

      <DestinationsFilters
        filters={destinations.filters}
        hasActiveFilters={destinations.hasActiveFilters}
        onApplyFilters={destinations.setFilters}
        onClearFilters={destinations.clearFilters}
      />

      <QueryState
        isLoading={destinations.isLoading}
        isError={destinations.isError}
        isEmpty={destinations.isEmpty}
        error={destinations.error}
        onRetry={() => void destinations.refetch()}
        loading={<LoadingSkeleton variant="card" count={6} label="Carregando destinos" />}
        empty={
          <EmptyState
            icon={MapPin}
            title="Nenhum destino encontrado"
            description={
              destinations.hasActiveFilters
                ? 'Tente ajustar ou limpar os filtros para ver mais destinos.'
                : 'Os destinos do catálogo aparecerão aqui em breve.'
            }
            action={
              destinations.hasActiveFilters ? (
                <Button variant="secondary" onClick={destinations.clearFilters}>
                  Limpar filtros
                </Button>
              ) : undefined
            }
          />
        }
      >
        <div className="flex flex-col gap-8">
          <ul
            aria-label="Lista de destinos"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {destinations.items.map((destination) => (
              <li key={destination.id}>
                <DestinationCard destination={destination} />
              </li>
            ))}
          </ul>

          {showPagination && (
            <nav
              aria-label="Paginação dos destinos"
              className="flex flex-wrap items-center justify-between gap-4"
            >
              <Button
                variant="secondary"
                disabled={!destinations.hasPrevious || destinations.isFetching}
                leftIcon={<ChevronLeft aria-hidden="true" size={20} />}
                onClick={() => destinations.setPage(destinations.page - 1)}
              >
                Anterior
              </Button>
              <span aria-live="polite" className="text-body-sm text-gray-dim tabular">
                Página {destinations.page}
                {totalPages ? ` de ${totalPages}` : ''}
              </span>
              <Button
                variant="secondary"
                disabled={!destinations.hasNext || destinations.isFetching}
                rightIcon={<ChevronRight aria-hidden="true" size={20} />}
                onClick={() => destinations.setPage(destinations.page + 1)}
              >
                Próxima
              </Button>
            </nav>
          )}
        </div>
      </QueryState>
    </div>
  )
}
