import { Plane } from 'lucide-react'
import { tripStatusIcons } from '../../components/trips/tripStatusIcons'
import { FilterPanel } from '../../components/ui/FilterPanel'
import { StatFilter } from '../../components/ui/StatFilter'
import type { TripCounts } from '../../hooks/useTripCounts'
import { tripStatusLabels, type TripStatus } from '../../utils/labels'

const TRIP_STATUSES: TripStatus[] = ['PLANNING', 'CONFIRMED', 'COMPLETED']
const ALL = 'ALL'

type TripsStatusFilterProps = {
  status?: TripStatus
  /** Quantidade por status; indefinida enquanto carrega ou se a contagem falhar. */
  counts?: TripCounts
  onChange: (status?: TripStatus) => void
}

/** Painel das viagens na caixa marrom: quantas há em cada status, e o filtro por ele. */
export function TripsStatusFilter({ status, counts, onChange }: TripsStatusFilterProps) {
  const options = [
    { id: ALL, label: 'Todas', icon: Plane, count: counts?.total },
    ...TRIP_STATUSES.map((option) => ({
      id: option,
      label: tripStatusLabels[option],
      icon: tripStatusIcons[option],
      count: counts?.[option],
    })),
  ]

  return (
    <FilterPanel>
      <StatFilter
        label="Filtrar por status"
        options={options}
        value={status ?? ALL}
        onChange={(id) => onChange(id === ALL ? undefined : (id as TripStatus))}
      />
    </FilterPanel>
  )
}
