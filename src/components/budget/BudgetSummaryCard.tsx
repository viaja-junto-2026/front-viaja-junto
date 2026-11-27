import { Pencil } from 'lucide-react'
import type { BudgetSummary } from '../../services/budgets'
import { formatCurrency, formatPercent } from '../../utils/format'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { Card, CardTitle } from '../ui/Card'
import { ProgressBar } from '../ui/ProgressBar'

type BudgetSummaryCardProps = {
  /** Resumo de uma viagem que já tem orçamento. */
  summary: BudgetSummary & { totalValue: number }
  /** Só para quem pode alterar o orçamento. */
  onEdit?: () => void
}

/**
 * Quanto do total já está comprometido. Um total zero com algo planejado conta como
 * estourado, sem porcentagem. A porcentagem nunca mostra "100 %" se ainda sobra algo,
 * nem esconde um estouro pequeno.
 */
function describeUsage({ planned, totalValue, overBudget }: BudgetSummaryCardProps['summary']) {
  if (totalValue === 0) {
    return overBudget ? 'Tudo o que está planejado passa do orçamento.' : 'Nada planejado ainda.'
  }
  const rounded = Math.round((planned / totalValue) * 100)
  let percent = rounded
  if (overBudget) percent = Math.max(rounded, 101)
  else if (planned < totalValue) percent = Math.min(rounded, 99)
  return `${formatPercent(percent)} do orçamento planejado`
}

/** Total, planejado e saldo da viagem, com a barra de quanto já foi comprometido. */
export function BudgetSummaryCard({ summary, onEdit }: BudgetSummaryCardProps) {
  const { currency, totalValue, planned, overBudget, unpricedActivities } = summary
  const remaining = summary.remaining ?? totalValue - planned
  const money = (value: number) => formatCurrency(value, currency)
  const values = [
    { label: 'Total', value: totalValue, negative: false },
    { label: 'Planejado', value: planned, negative: false },
    { label: 'Saldo', value: remaining, negative: remaining < 0 },
  ]

  return (
    <Card as="section" aria-label="Resumo do orçamento" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CardTitle>Resumo do orçamento</CardTitle>
        {onEdit && (
          <Button
            variant="outline"
            leftIcon={<Pencil aria-hidden="true" size={16} />}
            onClick={onEdit}
          >
            Alterar total
          </Button>
        )}
      </div>

      {/* No celular, um valor por linha; no computador, os três lado a lado. */}
      <dl className="flex flex-col divide-y divide-beige-sand lg:grid lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        {values.map(({ label, value, negative }) => (
          <div
            key={label}
            className="flex flex-wrap items-baseline justify-between gap-x-3 py-3 lg:flex-col lg:justify-start lg:gap-1 lg:px-6 lg:py-0 lg:first:pl-0"
          >
            <dt className="text-label-md text-gray-dim">{label}</dt>
            <dd
              className={`tabular text-numeric-lg ${negative ? 'text-red-burgundy' : 'text-brown-espresso'}`}
            >
              {money(value)}
            </dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-col gap-2">
        <ProgressBar
          label="Orçamento comprometido"
          value={overBudget ? 1 : planned}
          max={overBudget ? 1 : totalValue}
        />
        <p className="tabular text-body-sm text-gray-dim">{describeUsage(summary)}</p>
      </div>

      {overBudget && (
        <Alert variant="warning" title="Orçamento estourado">
          O planejado passou o total em {money(Math.abs(remaining))}.
        </Alert>
      )}
      {unpricedActivities > 0 && (
        <p className="text-body-sm text-gray-dim">
          {unpricedActivities === 1
            ? '1 atividade ainda está sem custo e não entra na conta.'
            : `${unpricedActivities} atividades ainda estão sem custo e não entram na conta.`}
        </p>
      )}
    </Card>
  )
}
