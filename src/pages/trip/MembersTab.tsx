import { Users } from 'lucide-react'
import { EmptyState } from '../../components/feedback/EmptyState'
import { LoadingSkeleton } from '../../components/feedback/LoadingSkeleton'
import { QueryState } from '../../components/feedback/QueryState'
import { InviteCodeCard } from '../../components/members/InviteCodeCard'
import { MemberRow } from '../../components/members/MemberRow'
import { Card, CardTitle } from '../../components/ui/Card'
import { useTripMembers } from '../../hooks/useTripMembers'
import { ApiError } from '../../services/apiError'
import type { Trip } from '../../services/trips'

/**
 * Aba Membros: quem participa da viagem. Só quem a criou vê o código de convite, muda
 * permissões e remove pessoas; os demais apenas veem a lista.
 */
export function MembersTab({ trip }: { trip: Trip }) {
  const members = useTripMembers(trip)
  const isOwner = trip.role === 'OWNER'
  const forbidden = members.error instanceof ApiError && members.error.status === 403

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      {isOwner && <InviteCodeCard tripId={trip.id} />}

      <QueryState
        isLoading={members.isLoading}
        isError={members.isError}
        error={members.error}
        errorMessage={forbidden ? 'Você não tem acesso aos membros desta viagem.' : undefined}
        onRetry={() => void members.refetch()}
        loading={<LoadingSkeleton variant="card" count={2} label="Carregando membros" />}
      >
        <Card as="section" aria-label="Membros" className="flex flex-col gap-2">
          <CardTitle>Quem está na viagem</CardTitle>
          <p className="text-body-md text-gray-dim">
            {isOwner
              ? 'Editores mudam o roteiro e o orçamento. Visualizadores só acompanham.'
              : 'Só quem criou a viagem convida pessoas e muda as permissões.'}
          </p>
          <ul aria-label="Pessoas da viagem" className="flex flex-col divide-y divide-beige-sand">
            {members.people.map((person) => (
              <MemberRow key={person.userId} tripId={trip.id} person={person} canManage={isOwner} />
            ))}
          </ul>
          {members.people.length === 1 && (
            <EmptyState
              icon={Users}
              plainIcon
              title="Ninguém entrou ainda"
              description={
                isOwner
                  ? 'Envie o código de convite para o grupo planejar junto.'
                  : 'Quem entrar com o código de convite aparece aqui.'
              }
            />
          )}
        </Card>
      </QueryState>
    </div>
  )
}
