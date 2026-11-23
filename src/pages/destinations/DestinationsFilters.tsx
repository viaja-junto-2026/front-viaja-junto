import { Search, X } from 'lucide-react'
import type { FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { Chip } from '../../components/ui/Chip'
import { Input } from '../../components/ui/Input'
import type { DestinationFilters } from '../../hooks/useDestinations'
import { destinationCategoryLabels, type DestinationCategory } from '../../utils/labels'

const DESTINATION_CATEGORIES: DestinationCategory[] = ['CITY', 'BEACH', 'NATURE', 'CULTURAL']

type DestinationsFiltersProps = {
  filters: DestinationFilters
  hasActiveFilters: boolean
  onApplyFilters: (changes: Partial<DestinationFilters>) => void
  onClearFilters: () => void
}

/**
 * Barra de busca e filtros do catálogo de destinos: busca por nome, país,
 * chips de categoria e botão para limpar filtros.
 */
export function DestinationsFilters({
  filters,
  hasActiveFilters,
  onApplyFilters,
  onClearFilters,
}: DestinationsFiltersProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const q = String(formData.get('q') ?? '').trim() || undefined
    const country = String(formData.get('country') ?? '').trim() || undefined
    onApplyFilters({ q, country })
  }

  function handleCategoryToggle(category?: DestinationCategory) {
    onApplyFilters({
      category: filters.category === category ? undefined : category,
    })
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-beige-sand bg-white p-4 sm:p-6">
      <form
        key={`${filters.q ?? ''}|${filters.country ?? ''}`}
        role="search"
        aria-label="Buscar destinos"
        onSubmit={handleSubmit}
        className="grid gap-4 sm:grid-cols-12 sm:items-end"
      >
        <div className="sm:col-span-5">
          <Input
            label="Buscar destino"
            name="q"
            type="search"
            defaultValue={filters.q ?? ''}
            placeholder="Ex.: Paris, Kyoto..."
          />
        </div>

        <div className="sm:col-span-4">
          <Input
            label="País"
            name="country"
            defaultValue={filters.country ?? ''}
            placeholder="Ex.: França ou FR"
          />
        </div>

        <div className="sm:col-span-3">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            leftIcon={<Search aria-hidden="true" size={20} />}
          >
            Buscar
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Filtrar por categoria" className="flex flex-wrap gap-2">
          <Chip selected={!filters.category} onClick={() => handleCategoryToggle(undefined)}>
            Todas
          </Chip>
          {DESTINATION_CATEGORIES.map((category) => (
            <Chip
              key={category}
              selected={filters.category === category}
              onClick={() => handleCategoryToggle(category)}
            >
              {destinationCategoryLabels[category]}
            </Chip>
          ))}
        </div>

        {hasActiveFilters && (
          <Button
            variant="compact"
            leftIcon={<X aria-hidden="true" size={16} />}
            onClick={onClearFilters}
          >
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  )
}
