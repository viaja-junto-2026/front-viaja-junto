import { MapPin, Plus } from 'lucide-react'
import { useState } from 'react'
import { EmptyState } from '../../components/feedback/EmptyState'
import { LoadingSkeleton } from '../../components/feedback/LoadingSkeleton'
import { QueryState } from '../../components/feedback/QueryState'
import { AddActivityDialog, EditActivityDialog } from '../../components/trips/ActivityDialogs'
import { ItineraryStop, type StopActions } from '../../components/trips/ItineraryStop'
import { AddStopDialog, EditStopDialog } from '../../components/trips/StopDialogs'
import { toDay } from '../../components/trips/stopFormValues'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { useReorderStops } from '../../hooks/useItineraryMutations'
import type { RouteStop, useTripRoute } from '../../hooks/useTripRoute'
import type { Trip } from '../../services/trips'
import { getErrorMessage } from '../../utils/errorMessages'
import { activityNotices, stopNotices } from '../../utils/schedule'

/** A janela aberta no momento. Guarda os ids: os dados vêm sempre do roteiro atual. */
type OpenDialog =
  | { kind: 'addStop' }
  | { kind: 'editStop'; stopId: string }
  | { kind: 'addActivity'; stopId: string }
  | { kind: 'editActivity'; stopId: string; activityId: string }

type ItineraryTabProps = {
  trip: Trip
  route: ReturnType<typeof useTripRoute>
}

/** Nova ordem com a parada `index` trocada com a vizinha (`-1` sobe, `1` desce). */
function swapped(stops: RouteStop[], index: number, step: -1 | 1): string[] {
  const ids = stops.map((stop) => stop.id)
  ;[ids[index], ids[index + step]] = [ids[index + step], ids[index]]
  return ids
}

/**
 * Aba Roteiro: destinos na ordem da visita, com as atividades de cada um. Quem é criador
 * ou editor adiciona, edita, exclui e reordena; quem só visualiza vê a mesma tela sem botões.
 */
export function ItineraryTab({ trip, route }: ItineraryTabProps) {
  const [dialog, setDialog] = useState<OpenDialog | null>(null)
  const reorder = useReorderStops(trip.id)
  const canEdit = trip.role !== 'VIEWER'
  const period = { start: toDay(trip.startDate), end: toDay(trip.endDate) }
  const close = () => setDialog(null)
  const notices = stopNotices(route.stops, trip)
  const activityWarnings = activityNotices(route.stops)

  const stop = route.stops.find((item) => dialog && 'stopId' in dialog && item.id === dialog.stopId)
  const activity =
    dialog?.kind === 'editActivity'
      ? stop?.activities.find((item) => item.id === dialog.activityId)
      : undefined

  const addStopButton = (
    <Button
      variant="solid"
      leftIcon={<Plus aria-hidden="true" size={20} />}
      onClick={() => setDialog({ kind: 'addStop' })}
    >
      Adicionar destino
    </Button>
  )

  function actionsFor(item: RouteStop, index: number): StopActions {
    return {
      onMoveUp: index > 0 ? () => reorder.mutate(swapped(route.stops, index, -1)) : undefined,
      onMoveDown:
        index < route.stops.length - 1
          ? () => reorder.mutate(swapped(route.stops, index, 1))
          : undefined,
      moving: reorder.isPending,
      onEdit: () => setDialog({ kind: 'editStop', stopId: item.id }),
      onAddActivity: () => setDialog({ kind: 'addActivity', stopId: item.id }),
      onEditActivity: (planned) =>
        setDialog({ kind: 'editActivity', stopId: item.id, activityId: planned.id }),
    }
  }

  return (
    <>
      <QueryState
        isLoading={route.isLoading}
        isError={route.isError}
        isEmpty={route.isEmpty}
        error={route.error}
        onRetry={() => void route.refetch()}
        loading={<LoadingSkeleton variant="card" count={3} label="Carregando roteiro" />}
        empty={
          <EmptyState
            icon={MapPin}
            plainIcon
            title={
              canEdit
                ? 'Esta viagem ainda não tem destinos. Adicione o primeiro!'
                : 'Esta viagem ainda não tem destinos'
            }
            description={
              canEdit ? undefined : 'Os destinos do roteiro aparecem aqui, na ordem da visita.'
            }
            action={canEdit ? addStopButton : undefined}
          />
        }
      >
        <div className="flex flex-col gap-4">
          {canEdit && (
            <div className="flex flex-col sm:flex-row sm:justify-end">{addStopButton}</div>
          )}
          {reorder.isError && <Alert variant="error">{getErrorMessage(reorder.error)}</Alert>}
          <ol aria-label="Destinos do roteiro" className="flex flex-col">
            {route.stops.map((item, index) => (
              <ItineraryStop
                key={item.id}
                stop={item}
                position={index + 1}
                last={index === route.stops.length - 1}
                currency={trip.currency}
                notices={notices.get(item.id)}
                activityNotices={activityWarnings}
                actions={canEdit ? actionsFor(item, index) : undefined}
              />
            ))}
          </ol>
        </div>
      </QueryState>

      {dialog?.kind === 'addStop' && (
        <AddStopDialog
          tripId={trip.id}
          stops={route.stops}
          trip={period}
          order={Math.max(-1, ...route.stops.map((item) => item.order ?? -1)) + 1}
          onClose={close}
        />
      )}
      {dialog?.kind === 'editStop' && stop && (
        <EditStopDialog
          tripId={trip.id}
          stops={route.stops}
          trip={period}
          stop={stop}
          onClose={close}
        />
      )}
      {dialog?.kind === 'addActivity' && stop && (
        <AddActivityDialog
          tripId={trip.id}
          stops={route.stops}
          stop={stop}
          currency={trip.currency}
          onClose={close}
        />
      )}
      {stop && activity && (
        <EditActivityDialog
          tripId={trip.id}
          stops={route.stops}
          stop={stop}
          activity={activity}
          currency={trip.currency}
          onClose={close}
        />
      )}
    </>
  )
}
