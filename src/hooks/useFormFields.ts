import { useEffect, useRef, useState } from 'react'
import { ApiError } from '../services/apiError'
import { getErrorMessage } from '../utils/errorMessages'

export type FieldErrors<TField extends string> = Partial<Record<TField, string>>

/** Erros que a API devolveu, separados entre os que têm campo e o aviso geral. */
export function readServerError<TField extends string>(
  error: unknown,
  fields: readonly TField[],
  /** Campo que explica um 409, quando o formulário tem um. */
  conflict?: { field: TField; message: string },
): { fields: FieldErrors<TField>; general?: string } {
  if (!error) return { fields: {} }

  if (error instanceof ApiError) {
    if (error.status === 409 && conflict) {
      return { fields: { [conflict.field]: conflict.message } as FieldErrors<TField> }
    }
    if (error.issues.length > 0) {
      const byField = Object.fromEntries(
        error.issues.map(({ field, message }) => [field, `Este campo ${message}.`]),
      ) as FieldErrors<TField>
      const unknown = error.issues.some(({ field }) => !fields.includes(field as TField))
      return { fields: byField, general: unknown ? getErrorMessage(error) : undefined }
    }
  }

  return { fields: {}, general: getErrorMessage(error) }
}

type Options<TValues, TField extends string> = {
  initialValues: TValues
  /** Erro da última tentativa de salvar. */
  error?: unknown
  fields: readonly TField[]
  conflict?: { field: TField; message: string }
}

/**
 * Valores e erros de um formulário: validação local, erros da API em cada campo (que somem
 * quando o campo muda) e foco no primeiro campo a corrigir.
 */
export function useFormFields<TValues extends object, TField extends string>({
  initialValues,
  error,
  fields,
  conflict,
}: Options<TValues, TField>) {
  const [values, setValues] = useState(initialValues)
  const [clientErrors, setClientErrors] = useState<FieldErrors<TField>>({})
  const [edited, setEdited] = useState<string[]>([])
  const formRef = useRef<HTMLFormElement>(null)
  const server = readServerError(error, fields, conflict)

  useEffect(() => {
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }, [clientErrors, error])

  return {
    values,
    formRef,
    generalError: server.general,
    errorOf(field: TField): string | undefined {
      return clientErrors[field] ?? (edited.includes(field) ? undefined : server.fields[field])
    },
    change<TKey extends keyof TValues & string>(key: TKey, value: TValues[TKey]) {
      setValues((current) => ({ ...current, [key]: value }))
      setClientErrors((current) => ({ ...current, [key]: undefined }))
      setEdited((current) => [...current, key])
    },
    /** Mostra os erros da validação local; devolve `true` se dá para enviar. */
    check(errors: FieldErrors<TField>): boolean {
      setClientErrors(errors)
      // Um campo conferido e sem problema pode vir como `undefined`.
      if (Object.values(errors).some(Boolean)) return false
      setEdited([])
      return true
    },
  }
}
