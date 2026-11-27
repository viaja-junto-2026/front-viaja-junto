import type { FormEvent } from 'react'
import { useFormFields } from '../../hooks/useFormFields'
import type { TripInput } from '../../services/trips'
import { tripStatusLabels, type TripStatus } from '../../utils/labels'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { ButtonLink } from '../ui/ButtonLink'
import { DatePicker } from '../ui/DatePicker'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Textarea'
import { TicketPerforation } from '../ui/TicketPerforation'
import { currencyOptions } from './currencyOptions'
import { validateTrip } from './tripFormValues'

const statusOptions = Object.entries(tripStatusLabels).map(([value, label]) => ({ value, label }))

const FIELDS = ['name', 'description', 'startDate', 'endDate', 'status', 'currency'] as const

/** 409 na edição: a moeda não muda depois que a viagem tem despesas. */
const CURRENCY_CONFLICT = {
  field: 'currency',
  message: 'A moeda não pode mudar porque a viagem já tem despesas.',
} as const

type TripFormProps = {
  initialValues: TripInput
  submitLabel: string
  /** Para onde o botão "Cancelar" leva. */
  cancelTo: string
  submitting?: boolean
  /** Erro da última tentativa de salvar: o 422 aparece em cada campo. */
  error?: unknown
  onSubmit: (values: TripInput) => void
  /** Impede datas que quebrem o que já foi planejado; devolve a explicação. */
  checkDates?: (values: TripInput) => string | undefined
}

/**
 * Formulário de viagem (criar e editar), em forma de cartão de embarque: o que é a viagem
 * em cima; quando acontece e como é acompanhada abaixo do picote.
 */
export function TripForm({
  initialValues,
  submitLabel,
  cancelTo,
  submitting = false,
  error,
  onSubmit,
  checkDates,
}: TripFormProps) {
  const { values, formRef, generalError, errorOf, change, check } = useFormFields({
    initialValues,
    error,
    fields: FIELDS,
    conflict: CURRENCY_CONFLICT,
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const errors = validateTrip(values)
    errors.endDate ??= checkDates?.(values)
    if (!check(errors)) return

    onSubmit({ ...values, name: values.name.trim(), description: values.description.trim() })
  }

  return (
    <form
      ref={formRef}
      noValidate
      aria-label="Dados da viagem"
      onSubmit={handleSubmit}
      className="flex flex-col drop-shadow-ticket"
    >
      <div className="flex flex-col gap-5 rounded-t-xs bg-white px-6 pt-8 pb-4 sm:px-10">
        <Input
          label="Nome da viagem"
          name="name"
          required
          placeholder="Ex.: Eurotrip 2027"
          value={values.name}
          error={errorOf('name')}
          onChange={(event) => change('name', event.target.value)}
        />
        <Textarea
          label="Descrição"
          name="description"
          rows={3}
          placeholder="O que o grupo quer viver nessa viagem?"
          helperText="Opcional."
          value={values.description}
          error={errorOf('description')}
          onChange={(event) => change('description', event.target.value)}
        />
      </div>

      <TicketPerforation />

      <div className="flex flex-col gap-5 rounded-b-xs bg-white px-6 pt-4 pb-8 sm:px-10">
        <div className="grid gap-5 sm:grid-cols-2">
          <DatePicker
            label="Data de início"
            value={values.startDate}
            error={errorOf('startDate')}
            onChange={(value) => change('startDate', value)}
          />
          <DatePicker
            label="Data final"
            min={values.startDate ?? undefined}
            value={values.endDate}
            error={errorOf('endDate')}
            onChange={(value) => change('endDate', value)}
          />
          <Select
            label="Status"
            options={statusOptions}
            value={values.status}
            error={errorOf('status')}
            onChange={(value) => change('status', value as TripStatus)}
          />
          <Select
            label="Moeda"
            options={currencyOptions(initialValues.currency)}
            value={values.currency}
            helperText="Usada no orçamento e nas despesas."
            error={errorOf('currency')}
            onChange={(value) => change('currency', value)}
          />
        </div>

        {generalError && <Alert variant="error">{generalError}</Alert>}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <ButtonLink to={cancelTo} variant="outline">
            Cancelar
          </ButtonLink>
          <Button type="submit" variant="solid" loading={submitting}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  )
}
