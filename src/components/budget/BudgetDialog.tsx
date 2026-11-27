import { useState, type FormEvent } from 'react'
import { useBudgetMutations } from '../../hooks/useBudget'
import { useFormFields } from '../../hooks/useFormFields'
import { getErrorMessage } from '../../utils/errorMessages'
import { formatCurrency } from '../../utils/format'
import { amountToText, parseAmount } from '../../utils/money'
import { Alert } from '../ui/Alert'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { FormActions } from '../ui/FormActions'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'

/** A API aceita qualquer número; acima disto é quase certo que foi erro de digitação. */
const MAX_TOTAL = 999_999_999.99

function validateTotal(text: string, currency: string): string | undefined {
  if (!text.trim()) return 'Informe o valor total.'
  const value = parseAmount(text)
  if (value === null) return 'Informe um valor como 8.500 ou 8.500,50.'
  if (value > MAX_TOTAL) return `O valor máximo é ${formatCurrency(MAX_TOTAL, currency)}.`
  return undefined
}

type BudgetDialogProps = {
  tripId: string
  /** Moeda da viagem. */
  currency: string
  /** Total atual; `null` enquanto a viagem não tem orçamento. */
  total: number | null
  onClose: () => void
}

/** Define ou altera o total do orçamento; ao alterar, também dá para excluí-lo. */
export function BudgetDialog({ tripId, currency, total, onClose }: BudgetDialogProps) {
  const [confirming, setConfirming] = useState(false)
  const { save, remove } = useBudgetMutations(tripId)
  const exists = total !== null
  const { values, formRef, generalError, errorOf, change, check } = useFormFields({
    initialValues: { totalValue: amountToText(total) },
    error: save.error,
    fields: ['totalValue'] as const,
    conflict: {
      field: 'totalValue',
      message: 'Esta viagem já tem um orçamento. Atualize a página.',
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!check({ totalValue: validateTotal(values.totalValue, currency) })) return
    save.mutate(parseAmount(values.totalValue)!, { onSuccess: onClose })
  }

  return (
    <>
      <Modal open onClose={onClose} title={exists ? 'Alterar orçamento' : 'Definir orçamento'}>
        <form
          ref={formRef}
          noValidate
          aria-label="Dados do orçamento"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <Input
            label={`Orçamento total (${currency})`}
            inputMode="decimal"
            autoComplete="off"
            placeholder="Ex.: 8.500,00"
            helperText="É o valor do grupo todo para a viagem inteira."
            value={values.totalValue}
            error={errorOf('totalValue')}
            onChange={(event) => change('totalValue', event.target.value)}
          />
          {generalError && <Alert variant="error">{generalError}</Alert>}
          <FormActions
            submitLabel="Salvar"
            submitting={save.isPending}
            onCancel={onClose}
            remove={
              exists
                ? { label: 'Excluir orçamento', onClick: () => setConfirming(true) }
                : undefined
            }
          />
        </form>
      </Modal>
      <ConfirmDialog
        open={confirming}
        title="Excluir o orçamento?"
        description={
          <div className="flex flex-col gap-3">
            <p>
              A viagem fica sem um valor total. O roteiro e os custos das atividades continuam como
              estão.
            </p>
            {remove.isError && <Alert variant="error">{getErrorMessage(remove.error)}</Alert>}
          </div>
        }
        loading={remove.isPending}
        onConfirm={() => remove.mutate(undefined, { onSuccess: onClose })}
        onCancel={() => setConfirming(false)}
      />
    </>
  )
}
