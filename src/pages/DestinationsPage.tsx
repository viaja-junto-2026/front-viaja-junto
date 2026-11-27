import { MapPin } from 'lucide-react'
import { DestinationShowcaseCard } from '../components/destinations/DestinationShowcaseCard'
import { EmptyState } from '../components/feedback/EmptyState'
import { LoadingSkeleton } from '../components/feedback/LoadingSkeleton'
import { QueryState } from '../components/feedback/QueryState'
import { Container } from '../components/layout/Container'
import { Button } from '../components/ui/Button'
import { PageBanner } from '../components/ui/PageBanner'
import { BandOverlap } from '../components/ui/BandOverlap'
import { Pagination } from '../components/ui/Pagination'
import { useDestinations } from '../hooks/useDestinations'
import { DestinationsFilters } from './destinations/DestinationsFilters'

/** Tela pública do catálogo de destinos (`/destinations`), com busca, filtros na URL e paginação. */
export default function DestinationsPage() {
  const destinations = useDestinations({ limit: 12 })
  const totalPages = destinations.meta?.totalPages
  const total = destinations.meta?.total ?? 0

  return (
    <>
      <PageBanner
        eyebrow="Descobrir"
        title="Destinos"
        description="Descubra cidades, praias e lugares bem avaliados para a sua próxima viagem."
      >
        {total > 0 && (
          <span className="tabular">
            {total === 1 ? '1 destino encontrado' : `${total} destinos encontrados`}
          </span>
        )}
      </PageBanner>

      <BandOverlap>
        <DestinationsFilters
          filters={destinations.filters}
          hasActiveFilters={destinations.hasActiveFilters}
          onApplyFilters={destinations.setFilters}
          onClearFilters={destinations.clearFilters}
        />
      </BandOverlap>

      <Container className="py-12">
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
                  <DestinationShowcaseCard destination={destination} />
                </li>
              ))}
            </ul>

            <Pagination
              label="Paginação dos destinos"
              page={destinations.page}
              totalPages={totalPages}
              hasPrevious={destinations.hasPrevious}
              hasNext={destinations.hasNext}
              busy={destinations.isFetching}
              onPageChange={destinations.setPage}
            />
          </div>
        </QueryState>
      </Container>
    </>
  )
}
