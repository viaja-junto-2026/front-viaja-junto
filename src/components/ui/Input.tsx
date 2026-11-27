import { useId, type InputHTMLAttributes } from 'react'
import { FieldShell, type FieldProps } from './Field'
import { getControlStyles, getDescriptionId } from './fieldStyles'

export type InputProps = FieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'children'>

/** Campo de texto de uma linha, com rótulo, texto de ajuda e estado de erro. */
export function Input({ label, helperText, error, inverted, id, className, ...rest }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const hasMessage = Boolean(error ?? helperText)

  return (
    <FieldShell
      id={inputId}
      label={label}
      helperText={helperText}
      error={error}
      inverted={inverted}
    >
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={hasMessage ? getDescriptionId(inputId) : undefined}
        className={`h-12 ${getControlStyles(error)} ${className ?? ''}`.trim()}
        {...rest}
      />
    </FieldShell>
  )
}
