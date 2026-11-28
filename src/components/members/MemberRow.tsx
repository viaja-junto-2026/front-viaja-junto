import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useMemberMutations, type TripPerson } from '../../hooks/useTripMembers'
import type { MemberPermission } from '../../services/members'
import { getErrorMessage } from '../../utils/errorMessages'
import { formatDate } from '../../utils/format'
import { memberRoleLabels } from '../../utils/labels'
import { Alert } from '../ui/Alert'
import { Avatar } from '../ui/Avatar'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { IconButton } from '../ui/IconButton'
import { Select } from '../ui/Select'
import { Tag } from '../ui/Tag'

const permissionOptions = (['EDITOR', 'VIEWER'] as const).map((value) => ({
  value,
  label: memberRoleLabels[value],
}))

/** Permissão e remoção de um membro: só o criador da viagem vê estes controles. */
function MemberControls({
  tripId,
  memberId,
  person,
}: {
  tripId: string
  memberId: string
  person: TripPerson
}) {
  const [confirming, setConfirming] = useState(false)
  const { changePermission, remove } = useMemberMutations(tripId, memberId)

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1 sm:w-48 sm:flex-none">
          <Select
            label={`Permissão de ${person.name}`}
            hideLabel
            options={permissionOptions}
            // Enquanto salva, mostra o que foi escolhido.
            value={changePermission.isPending ? changePermission.variables : person.role}
            disabled={changePermission.isPending}
            onChange={(value) => {
              if (value !== person.role) changePermission.mutate(value as MemberPermission)
            }}
          />
        </div>
        <IconButton label={`Remover ${person.name}`} onClick={() => setConfirming(true)}>
          <Trash2 aria-hidden="true" size={20} />
        </IconButton>
      </div>
      {changePermission.isError && (
        <div className="basis-full">
          <Alert variant="error">{getErrorMessage(changePermission.error)}</Alert>
        </div>
      )}
      <ConfirmDialog
        open={confirming}
        title="Remover da viagem?"
        confirmLabel="Remover"
        description={
          <div className="flex flex-col gap-3">
            <p>
              {person.name} perde o acesso a esta viagem. Para voltar, vai precisar do código de
              convite.
            </p>
            {remove.isError && <Alert variant="error">{getErrorMessage(remove.error)}</Alert>}
          </div>
        }
        loading={remove.isPending}
        onConfirm={() => remove.mutate(undefined, { onSuccess: () => setConfirming(false) })}
        onCancel={() => {
          setConfirming(false)
          remove.reset()
        }}
      />
    </>
  )
}

type MemberRowProps = {
  tripId: string
  person: TripPerson
  /** Quem criou a viagem muda permissões e remove os membros. */
  canManage: boolean
}

/** Uma pessoa da viagem: avatar, nome, desde quando está nela e o que pode fazer. */
export function MemberRow({ tripId, person, canManage }: MemberRowProps) {
  const { name, role, isSelf, memberId, joinedAt } = person

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-3 py-4">
      <Avatar name={name} />
      <div className="min-w-0 flex-1">
        <p className="text-label-lg break-words text-brown-espresso">
          {name}
          {isSelf && <span className="text-body-sm text-gray-dim"> (você)</span>}
        </p>
        <p className="text-body-sm text-gray-dim">
          {joinedAt ? `Entrou em ${formatDate(joinedAt)}` : 'Criou a viagem'}
        </p>
      </div>
      {canManage && memberId ? (
        // No celular, os controles ocupam uma linha própria.
        <div className="flex basis-full flex-col gap-2 sm:basis-auto">
          <MemberControls tripId={tripId} memberId={memberId} person={person} />
        </div>
      ) : (
        <Tag>{memberRoleLabels[role]}</Tag>
      )}
    </li>
  )
}
