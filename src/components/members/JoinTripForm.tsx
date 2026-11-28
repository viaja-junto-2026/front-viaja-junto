import { useState, type FormEvent } from 'react'
import { useJoinTrip } from '../../hooks/useInviteCode'
import { ApiError } from '../../services/apiError'
import type { Trip } from '../../services/trips'
import { getErrorMessage } from '../../utils/errorMessages'
import { normalizeInviteCode, validateInviteCode } from '../../utils/inviteCode'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

/** Erros da API que se resolvem mexendo no código: aparecem no próprio campo. */
const CODE_ERRORS: Record<number, string> = {
  404: 'Nenhuma viagem usa esse código. Confira as letras ou peça um novo a quem te convidou.',
  409: 'Você já participa desta viagem. Ela está em Minhas viagens.',
  422: 'Confira o código: são 8 letras e números.',
}

type JoinTripFormProps = {
  onJoined: (trip: Trip) => void
  /** Mostra o botão "Cancelar", dentro de uma janela. */
  onCancel?: () => void
}

/** Campo do código de convite e o botão de entrar, usado na página e na janela. */
export function JoinTripForm({ onJoined, onCancel }: JoinTripFormProps) {
  const [code, setCode] = useState('')
  const [invalid, setInvalid] = useState<string>()
  const join = useJoinTrip(onJoined)

  const status = join.error instanceof ApiError ? join.error.status : undefined
  const serverCodeError = status ? CODE_ERRORS[status] : undefined
  const generalError = join.error && !serverCodeError ? getErrorMessage(join.error) : undefined

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const problem = validateInviteCode(code)
    setInvalid(problem)
    if (!problem) join.mutate(code)
  }

  return (
    <form
      noValidate
      aria-label="Entrar com código"
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 text-left"
    >
      <Input
        label="Código de convite"
        name="code"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        placeholder="Ex.: K7M2QX9P"
        helperText="São 8 letras e números."
        className="tabular tracking-widest"
        value={code}
        error={invalid ?? serverCodeError}
        onChange={(event) => {
          setCode(normalizeInviteCode(event.target.value))
          setInvalid(undefined)
          join.reset()
        }}
      />
      {generalError && <Alert variant="error">{generalError}</Alert>}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" variant="solid" loading={join.isPending}>
          Entrar na viagem
        </Button>
      </div>
    </form>
  )
}
