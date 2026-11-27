import { useState, type FormEvent } from 'react'
import { useFormFields } from '../../hooks/useFormFields'
import { useAddStop, useRemoveStop, useUpdateStop } from '../../hooks/useItineraryMutations'
import type { RouteStop } from '../../hooks/useTripRoute'
import { listDestinations, type Destination } from '../../services/destinations'
import type { StopInput } from '../../services/itinerary'
import { getErrorMessage } from '../../utils/errorMessages'
import { reviewStop, type Review } from '../../utils/schedule'
import { Alert } from '../ui/Alert'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { DatePicker } from '../ui/DatePicker'
import { FormActions } from '../ui/FormActions'
import { Modal } from '../ui/Modal'
import { Textarea } from '../ui/Textarea'
import { WarningList } from '../ui/WarningList'
import { CatalogPicker, PICKER_LIMIT } from './CatalogPicker'
import { STOP_FIELDS, toStopInput, validateStop, type Period } from './stopFormValues'

type StopFormProps = {
  initialValues: StopInput
  /** Datas da viagem: a parada precisa caber nelas. */
  trip: Period
  submitLabel: string
  submitting?: boolean
  error?: unknown
  onSubmit: (values: StopInput) => void
  onCancel: () => void
  remove?: { label: string; onClick: () => void }
  /** Campos antes das datas, como a escolha do destino. */
  children?: React.ReactNode
  /** Confere as datas contra o resto do roteiro. */
  review: (values: StopInput) => Review
}

function StopForm({
  initialValues,
  trip,
  submitLabel,
  submitting,
  error,
  onSubmit,
  onCancel,
  remove,
  children,
  review,
}: StopFormProps) {
  const { values, formRef, generalError, errorOf, change, check } = useFormFields({
    initialValues,
    error,
    fields: STOP_FIELDS,
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const errors = validateStop(values, trip)
    errors.departure ??= review(values).blocker
    if (!check(errors)) return
    onSubmit({ ...values, description: values.description.trim() })
  }

  return (
    <form
      ref={formRef}
      noValidate
      aria-label="Dados do destino"
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
    >
      {children}
      <div className="grid gap-4 sm:grid-cols-2">
        <DatePicker
          label="Chegada"
          min={trip.start}
          max={trip.end}
          value={values.arrival}
          error={errorOf('arrival')}
          onChange={(value) => change('arrival', value)}
        />
        <DatePicker
          label="Saída"
          min={values.arrival ?? trip.start}
          max={trip.end}
          value={values.departure}
          error={errorOf('departure')}
          onChange={(value) => change('departure', value)}
        />
      </div>
      <WarningList warnings={review(values).warnings} />
      <Textarea
        label="Descrição"
        rows={3}
        helperText="Opcional."
        value={values.description}
        error={errorOf('description')}
        onChange={(event) => change('description', event.target.value)}
      />
      {generalError && <Alert variant="error">{generalError}</Alert>}
      <FormActions
        submitLabel={submitLabel}
        submitting={submitting}
        onCancel={onCancel}
        remove={remove}
      />
    </form>
  )
}

type AddStopDialogProps = {
  tripId: string
  stops: RouteStop[]
  trip: Period
  /** Posição da nova parada: no fim do roteiro. */
  order: number
  onClose: () => void
}

/** Escolhe um destino do catálogo e informa quando o grupo estará lá. */
export function AddStopDialog({ tripId, stops, trip, order, onClose }: AddStopDialogProps) {
  const [destination, setDestination] = useState<Destination | null>(null)
  const [missing, setMissing] = useState(false)
  const add = useAddStop(tripId, onClose)

  return (
    <Modal open onClose={onClose} title="Adicionar destino">
      <StopForm
        initialValues={toStopInput()}
        trip={trip}
        review={(values) => reviewStop(stops, { ...values, catalogId: destination?.id })}
        submitLabel="Adicionar"
        submitting={add.isPending}
        error={add.error}
        onCancel={onClose}
        onSubmit={(input) => {
          if (!destination) {
            setMissing(true)
            return
          }
          add.mutate({ destination, order, input })
        }}
      >
        <CatalogPicker
          label="Buscar destino no catálogo"
          placeholder="Ex.: Paris, Kyoto..."
          queryKey={['picker', 'destinations']}
          search={(q) => listDestinations({ q, limit: PICKER_LIMIT })}
          describe={({ name, country }) => ({ title: name, subtitle: country ?? undefined })}
          selected={destination}
          error={missing && !destination ? 'Escolha um destino da lista.' : undefined}
          onSelect={setDestination}
        />
      </StopForm>
    </Modal>
  )
}

type EditStopDialogProps = {
  tripId: string
  stops: RouteStop[]
  trip: Period
  stop: RouteStop
  onClose: () => void
}

/** Edita as datas e a descrição de uma parada, ou a remove (com confirmação). */
export function EditStopDialog({ tripId, stops, trip, stop, onClose }: EditStopDialogProps) {
  const [confirming, setConfirming] = useState(false)
  const update = useUpdateStop(tripId, stop.id, onClose)
  const remove = useRemoveStop(tripId, stop.id, onClose)
  const name = stop.catalog?.name ?? 'este destino'

  return (
    <>
      <Modal open onClose={onClose} title={`Editar ${name}`}>
        <StopForm
          initialValues={toStopInput(stop)}
          trip={trip}
          review={(values) =>
            reviewStop(stops, { ...values, catalogId: stop.destinationCatalogId }, stop)
          }
          submitLabel="Salvar"
          submitting={update.isPending}
          error={update.error}
          onCancel={onClose}
          onSubmit={(input) => update.mutate(input)}
          remove={{ label: 'Excluir destino', onClick: () => setConfirming(true) }}
        />
      </Modal>
      <ConfirmDialog
        open={confirming}
        title="Excluir este destino?"
        description={
          <div className="flex flex-col gap-3">
            <p>
              {name === 'este destino' ? 'Este destino' : name} sai do roteiro junto com as
              atividades planejadas nele. Não dá para desfazer.
            </p>
            {remove.isError && <Alert variant="error">{getErrorMessage(remove.error)}</Alert>}
          </div>
        }
        loading={remove.isPending}
        onConfirm={() => remove.mutate()}
        onCancel={() => setConfirming(false)}
      />
    </>
  )
}
