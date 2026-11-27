import { Plus, Wallet } from 'lucide-react'
import { useState } from 'react'
import { BudgetDialog } from '../../components/budget/BudgetDialog'
import { BudgetSummaryCard } from '../../components/budget/BudgetSummaryCard'
import { CategoryBreakdown } from '../../components/budget/CategoryBreakdown'
import { EmptyState } from '../../components/feedback/EmptyState'
import { LoadingSkeleton } from '../../components/feedback/LoadingSkeleton'
import { QueryState } from '../../components/feedback/QueryState'
import { Button } from '../../components/ui/Button'
import { useBudget } from '../../hooks/useBudget'
import type { Trip } from '../../services/trips'
import { formatCurrency } from '../../utils/format'

/**
 * Aba Orçamento: define o total e acompanha o que está planejado. Criador e editor mudam
 * o total; quem só visualiza vê a mesma tela sem botões.
 */
export function BudgetTab({ trip }: { trip: Trip }) {
  const [editing, setEditing] = useState(false)
  const { summary } = useBudget(trip.id)
  const data = summary.data
  const total = data?.totalValue ?? null
  const canEdit = trip.role !== 'VIEWER'

  const emptyDescription = [
    data && data.planned > 0
      ? `As atividades planejadas já somam ${formatCurrency(data.planned, data.currency)}.`
      : null,
    canEdit
      ? 'Com um total definido, o grupo acompanha o saldo.'
      : 'Só o criador e os editores podem definir o total.',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <QueryState
        isLoading={summary.isLoading}
        isError={summary.isError}
        error={summary.error}
        onRetry={() => void summary.refetch()}
        loading={<LoadingSkeleton variant="card" count={2} label="Carregando orçamento" />}
        isEmpty={total === null}
        empty={
          <EmptyState
            icon={Wallet}
            plainIcon
            title={canEdit ? 'Defina o orçamento da viagem' : 'Esta viagem ainda não tem orçamento'}
            description={emptyDescription}
            action={
              canEdit ? (
                <Button
                  variant="solid"
                  leftIcon={<Plus aria-hidden="true" size={20} />}
                  onClick={() => setEditing(true)}
                >
                  Definir orçamento
                </Button>
              ) : undefined
            }
          />
        }
      >
        {data && total !== null && (
          <div className="mx-auto flex max-w-4xl flex-col gap-6">
            <BudgetSummaryCard
              summary={{ ...data, totalValue: total }}
              onEdit={canEdit ? () => setEditing(true) : undefined}
            />
            <CategoryBreakdown
              categories={data.byCategory}
              currency={data.currency}
              total={total}
            />
          </div>
        )}
      </QueryState>

      {/* Fica fora dos estados: a janela continua aberta enquanto o resumo é atualizado. */}
      {editing && canEdit && (
        <BudgetDialog
          tripId={trip.id}
          currency={data?.currency ?? trip.currency}
          total={total}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  )
}
