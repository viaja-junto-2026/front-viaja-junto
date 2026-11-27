import { Chip } from '../../components/ui/Chip'
import { FilterPanel } from '../../components/ui/FilterPanel'
import { tripStatusLabels, type TripStatus } from '../../utils/labels'

const TRIP_STATUSES: TripStatus[] = ['PLANNING', 'CONFIRMED', 'COMPLETED']

type TripsStatusFilterProps = {
  status?: TripStatus
  onChange: (status?: TripStatus) => void
}

/** Filtro por status das viagens, na caixa marrom. */
export function TripsStatusFilter({ status, onChange }: TripsStatusFilterProps) {
  return (
    <FilterPanel>
      <div
        role="group"
        aria-label="Filtrar por status"
        className="flex flex-wrap justify-center gap-2"
      >
        <Chip selected={!status} onClick={() => onChange(undefined)}>
          Todas
        </Chip>
        {TRIP_STATUSES.map((option) => (
          <Chip key={option} selected={status === option} onClick={() => onChange(option)}>
            {tripStatusLabels[option]}
          </Chip>
        ))}
      </div>
    </FilterPanel>
  )
}
