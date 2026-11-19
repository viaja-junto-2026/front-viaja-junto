import { useId, type TextareaHTMLAttributes } from 'react'
import { FieldShell, type FieldProps } from './Field'
import { getControlStyles, getDescriptionId } from './fieldStyles'

export type TextareaProps = FieldProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'children'>

/** Campo de texto de várias linhas, com rótulo, texto de ajuda e estado de erro. */
export function Textarea({
  label,
  helperText,
  error,
  id,
  className,
  rows = 4,
  ...rest
}: TextareaProps) {
  const generatedId = useId()
  const textareaId = id ?? generatedId
  const hasMessage = Boolean(error ?? helperText)

  return (
    <FieldShell id={textareaId} label={label} helperText={helperText} error={error}>
      <textarea
        id={textareaId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={hasMessage ? getDescriptionId(textareaId) : undefined}
        className={`py-3 ${getControlStyles(error)} ${className ?? ''}`.trim()}
        {...rest}
      />
    </FieldShell>
  )
}
