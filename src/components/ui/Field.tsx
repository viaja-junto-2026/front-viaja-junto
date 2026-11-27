import { CircleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { getDescriptionId } from './fieldStyles'

export type FieldProps = {
  /** Rótulo visível acima do campo. */
  label: string
  /** Texto de ajuda abaixo do campo. */
  helperText?: string
  /** Rótulo em branco, para campos sobre fundo escuro (Bordô). */
  inverted?: boolean
  /** Mensagem de erro: diga como corrigir. Substitui o texto de ajuda. */
  error?: string
}

type FieldShellProps = FieldProps & {
  id: string
  children: ReactNode
}

/** Estrutura comum de Input, Textarea e Select: rótulo, campo e ajuda ou erro. */
export function FieldShell({
  id,
  label,
  helperText,
  error,
  inverted = false,
  children,
}: FieldShellProps) {
  const message = error ?? helperText

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className={`text-label-md ${inverted ? 'text-white' : 'text-gray-ink'}`}>
        {label}
      </label>
      {children}
      {message && (
        <p
          id={getDescriptionId(id)}
          className={
            error
              ? 'flex items-start gap-1 text-body-sm text-red-burgundy'
              : 'text-body-sm text-gray-dim'
          }
        >
          {error && <CircleAlert aria-hidden="true" size={16} className="mt-0.5 shrink-0" />}
          {message}
        </p>
      )}
    </div>
  )
}
