import { useState, type FormEvent, type ReactNode } from 'react'
import { useFormFields } from '../../hooks/useFormFields'
import {
  useAddActivity,
  useRemoveActivity,
  useUpdateActivity,
} from '../../hooks/useItineraryMutations'
import type { PlannedActivity, RouteStop } from '../../hooks/useTripRoute'
import { listActivities, type Activity } from '../../services/activities'
import type { TripActivityInput } from '../../services/itinerary'
import { getErrorMessage } from '../../utils/errorMessages'
import { activityStatusLabels, activityTypeLabels, type ActivityStatus } from '../../utils/labels'
import { reviewActivity, type Review } from '../../utils/schedule'
import { Alert } from '../ui/Alert'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { DatePicker } from '../ui/DatePicker'
import { FormActions } from '../ui/FormActions'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { Select } from '../ui/Select'
import { WarningList } from '../ui/WarningList'
import {
  ACTIVITY_FIELDS,
  timeOptions,
  toActivityInput,
  toActivityValues,
  validateActivity,
  type ActivityValues,
} from './activityFormValues'
import { CatalogPicker, PICKER_LIMIT } from './CatalogPicker'
import { toDay, type Period } from './stopFormValues'

const statusOptions = Object.entries(activityStatusLabels).map(([value, label]) => ({
  value,
  label,
}))

function stayOf(stop: RouteStop): Period {
  return { start: toDay(stop.arrival), end: toDay(stop.departure) }
}

type ActivityFormProps = {
  initialValues: ActivityValues
  stay: Period
  currency: string
  submitLabel: string
  submitting?: boolean
  error?: unknown
  onSubmit: (input: TripActivityInput) => void
  onCancel: () => void
  remove?: { label: string; onClick: () => void }
  children?: ReactNode
  /** Confere o dia e o horário contra o resto do roteiro. */
  review: (input: TripActivityInput) => Review
}

function ActivityForm({
  initialValues,
  stay,
  currency,
  submitLabel,
  submitting,
  error,
  onSubmit,
  onCancel,
  remove,
  children,
  review,
}: ActivityFormProps) {
  const { values, formRef, generalError, errorOf, change, check } = useFormFields({
    initialValues,
    error,
    fields: ACTIVITY_FIELDS,
  })
  const durationError = errorOf('durationMinutes')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const errors = validateActivity(values, stay)
    const input = toActivityInput(values)
    errors.time ??= review(input).blocker
    if (!check(errors)) return
    onSubmit(input)
  }

  return (
    <form
      ref={formRef}
      noValidate
      aria-label="Dados da atividade"
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
    >
      {children}
      <div className="grid gap-4 sm:grid-cols-2">
        <DatePicker
          label="Dia"
          min={stay.start}
          max={stay.end}
          value={values.dateTime}
          error={errorOf('dateTime')}
          onChange={(value) => change('dateTime', value)}
        />
        <Select
          label="Horário"
          placeholder="Escolha a hora"
          options={timeOptions(values.time)}
          value={values.time}
          error={errorOf('time')}
          onChange={(value) => change('time', value)}
        />
        <Input
          label="Duração: horas"
          inputMode="numeric"
          placeholder="Ex.: 2"
          value={values.hours}
          error={durationError}
          onChange={(event) => change('hours', event.target.value)}
        />
        <Input
          label="Duração: minutos"
          inputMode="numeric"
          placeholder="Ex.: 30"
          value={values.minutes}
          onChange={(event) => change('minutes', event.target.value)}
        />
        <Input
          label={`Custo esperado por pessoa (${currency})`}
          inputMode="decimal"
          placeholder="Ex.: 150,00"
          value={values.expectedCost}
          error={errorOf('expectedCost')}
          onChange={(event) => change('expectedCost', event.target.value)}
        />
        <Select
          label="Status"
          options={statusOptions}
          value={values.status}
          error={errorOf('status')}
          onChange={(value) => change('status', value as ActivityStatus)}
        />
      </div>
      <WarningList warnings={review(toActivityInput(values)).warnings} />
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

type AddActivityDialogProps = {
  tripId: string
  stops: RouteStop[]
  stop: RouteStop
  currency: string
  onClose: () => void
}

/** Escolhe uma atividade do catálogo do destino e informa quando ela acontece. */
export function AddActivityDialog({
  tripId,
  stops,
  stop,
  currency,
  onClose,
}: AddActivityDialogProps) {
  const [activity, setActivity] = useState<Activity | null>(null)
  const [missing, setMissing] = useState(false)
  const add = useAddActivity(tripId, stop.id, onClose)

  return (
    <Modal
      open
      onClose={onClose}
      title={`Adicionar atividade em ${stop.catalog?.name ?? 'destino'}`}
    >
      <ActivityForm
        initialValues={toActivityValues()}
        stay={stayOf(stop)}
        currency={currency}
        review={(input) =>
          reviewActivity(stops, stop, {
            ...input,
            catalogId: activity?.id,
            isLodging: activity?.type === 'LODGING',
          })
        }
        submitLabel="Adicionar"
        submitting={add.isPending}
        error={add.error}
        onCancel={onClose}
        onSubmit={(input) => {
          if (!activity) {
            setMissing(true)
            return
          }
          add.mutate({ activity, input })
        }}
      >
        <CatalogPicker
          label="Buscar atividade no catálogo"
          placeholder="Ex.: museu, café..."
          queryKey={['picker', 'activities', stop.destinationCatalogId]}
          search={(q) =>
            listActivities({ destinationId: stop.destinationCatalogId, q, limit: PICKER_LIMIT })
          }
          describe={({ name, type }) => ({ title: name, subtitle: activityTypeLabels[type] })}
          selected={activity}
          error={missing && !activity ? 'Escolha uma atividade da lista.' : undefined}
          onSelect={setActivity}
        />
      </ActivityForm>
    </Modal>
  )
}

type EditActivityDialogProps = {
  tripId: string
  stops: RouteStop[]
  stop: RouteStop
  activity: PlannedActivity
  currency: string
  onClose: () => void
}

/** Edita uma atividade planejada, ou a remove (com confirmação). */
export function EditActivityDialog({
  tripId,
  stops,
  stop,
  activity,
  currency,
  onClose,
}: EditActivityDialogProps) {
  const [confirming, setConfirming] = useState(false)
  const update = useUpdateActivity(tripId, activity.id, onClose)
  const remove = useRemoveActivity(tripId, activity.id, onClose)
  const name = activity.catalog?.name ?? 'Atividade'

  return (
    <>
      <Modal open onClose={onClose} title={`Editar ${name}`}>
        <ActivityForm
          initialValues={toActivityValues(activity)}
          stay={stayOf(stop)}
          currency={currency}
          review={(input) =>
            reviewActivity(
              stops,
              stop,
              {
                ...input,
                catalogId: activity.activityCatalogId,
                isLodging: activity.catalog?.type === 'LODGING',
              },
              activity,
            )
          }
          submitLabel="Salvar"
          submitting={update.isPending}
          error={update.error}
          onCancel={onClose}
          onSubmit={(input) => update.mutate(input)}
          remove={{ label: 'Excluir atividade', onClick: () => setConfirming(true) }}
        />
      </Modal>
      <ConfirmDialog
        open={confirming}
        title="Excluir esta atividade?"
        description={
          <div className="flex flex-col gap-3">
            <p>{name} sai do roteiro. Não dá para desfazer.</p>
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
