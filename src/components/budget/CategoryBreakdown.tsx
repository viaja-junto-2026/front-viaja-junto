import { BedDouble, Bus, Shapes, Ticket, Utensils, type LucideIcon } from 'lucide-react'
import type { CategoryConsumption } from '../../services/budgets'
import { formatCurrency } from '../../utils/format'
import { budgetCategoryLabels, type ActivityType } from '../../utils/labels'
import { Card, CardTitle } from '../ui/Card'
import { IconTile } from '../ui/IconTile'
import { ProgressBar } from '../ui/ProgressBar'

const categoryIcons: Record<ActivityType, LucideIcon> = {
  TOUR: Ticket,
  FOOD: Utensils,
  LODGING: BedDouble,
  TRANSPORT: Bus,
  OTHER: Shapes,
}

function describeCount(count: number): string {
  if (count === 0) return 'Nenhuma atividade'
  return count === 1 ? '1 atividade' : `${count} atividades`
}

type CategoryBreakdownProps = {
  /** As cinco categorias, na ordem da API. */
  categories: CategoryConsumption[]
  currency: string
  /** Orçamento total: a barra de cada categoria mostra quanto dele ela ocupa. */
  total: number
}

/** Quanto cada tipo de atividade consome do orçamento. */
export function CategoryBreakdown({ categories, currency, total }: CategoryBreakdownProps) {
  return (
    <Card as="section" aria-label="Consumo por categoria" className="flex flex-col gap-2">
      <CardTitle>Consumo por categoria</CardTitle>
      <ul className="flex flex-col divide-y divide-beige-sand">
        {categories.map(({ type, planned, count }) => (
          <li key={type} className="flex items-center gap-3 py-4 sm:gap-4">
            <IconTile icon={categoryIcons[type]} />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="text-label-lg text-brown-espresso">{budgetCategoryLabels[type]}</p>
                <p className="tabular text-numeric-md">{formatCurrency(planned, currency)}</p>
              </div>
              <ProgressBar
                label={`${budgetCategoryLabels[type]} no orçamento`}
                // Com total zero, qualquer gasto planejado ocupa a barra inteira.
                value={total > 0 ? planned : Math.sign(planned)}
                max={total > 0 ? total : 1}
              />
              <p className="text-body-sm text-gray-dim">{describeCount(count)}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
