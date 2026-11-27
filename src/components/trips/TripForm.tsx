import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ApiError } from '../../services/apiError'
import type { TripInput } from '../../services/trips'
import { getErrorMessage } from '../../utils/errorMessages'
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
import { validateTrip, type TripFormErrors } from './tripFormValues'

const statusOptions = Object.entries(tripStatusLabels).map(([value, label]) => ({ value, label }))

type Field = keyof TripInput

/** Erros que a API devolveu, separados entre os que têm campo e o aviso geral. */
function readServerError(error: unknown): { fields: TripFormErrors; general?: string } {
  if (!error) return { fields: {} }

  if (error instanceof ApiError) {
    // 409 na edição: a moeda não muda depois que a viagem tem despesas.
    if (error.status === 409) {
      return { fields: { currency: 'A moeda não pode mudar porque a viagem já tem despesas.' } }
    }
    if (error.issues.length > 0) {
      const fields = Object.fromEntries(
        error.issues.map(({ field, message }) => [field, `Este campo ${message}.`]),
      ) as TripFormErrors
      const known = ['name', 'description', 'startDate', 'endDate', 'status', 'currency']
      const unknown = error.issues.some(({ field }) => !known.includes(field))
      return { fields, general: unknown ? getErrorMessage(error) : undefined }
    }
  }

  return { fields: {}, general: getErrorMessage(error) }
}

type TripFormProps = {
  initialValues: TripInput
  submitLabel: string
  /** Para onde o botão "Cancelar" leva. */
  cancelTo: string
  submitting?: boolean
  /** Erro da última tentativa de salvar: o 422 aparece em cada campo. */
  error?: unknown
  onSubmit: (values: TripInput) => void
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
}: TripFormProps) {
  const [values, setValues] = useState(initialValues)
  const [clientErrors, setClientErrors] = useState<TripFormErrors>({})
  // Campos alterados depois do último envio: o erro antigo da API deixa de valer para eles.
  const [edited, setEdited] = useState<Field[]>([])
  const formRef = useRef<HTMLFormElement>(null)

  const server = readServerError(error)

  function errorOf(field: Field): string | undefined {
    return clientErrors[field] ?? (edited.includes(field) ? undefined : server.fields[field])
  }

  function change<TField extends Field>(field: TField, value: TripInput[TField]) {
    setValues((current) => ({ ...current, [field]: value }))
    setClientErrors((current) => ({ ...current, [field]: undefined }))
    setEdited((current) => [...current, field])
  }

  // Depois de uma tentativa com erro, o foco vai para o primeiro campo a corrigir.
  useEffect(() => {
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }, [clientErrors, error])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const errors = validateTrip(values)
    setClientErrors(errors)
    if (Object.keys(errors).length > 0) return

    setEdited([])
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

        {server.general && <Alert variant="error">{server.general}</Alert>}

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
