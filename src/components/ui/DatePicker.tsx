import { CalendarDays } from 'lucide-react'
import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react'
import { todayIso } from '../../utils/calendar'
import { formatDate } from '../../utils/format'
import { Button } from './Button'
import { Calendar } from './Calendar'
import { FieldShell, type FieldProps } from './Field'
import { getControlStyles, getDescriptionId } from './fieldStyles'

type DatePickerProps = FieldProps & {
  /** Dia escolhido (`AAAA-MM-DD`) ou `null`. */
  value: string | null
  onChange: (value: string | null) => void
  /** Primeiro dia que pode ser escolhido. */
  min?: string
  /** Último dia que pode ser escolhido. */
  max?: string
  placeholder?: string
}

/**
 * Campo de data com calendário próprio (o calendário nativo do navegador não aceita estilo).
 * Mostra a data como no resto do app (`12 mar. 2027`). Esc fecha o calendário.
 */
export function DatePicker({
  label,
  helperText,
  error,
  inverted,
  value,
  onChange,
  min,
  max,
  placeholder = 'Escolha a data',
}: DatePickerProps) {
  const id = useId()
  const dialogId = `${id}-dialog`
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const today = todayIso()

  // Aberto no fim da tela ou de uma janela, o calendário rola até ficar visível.
  useEffect(() => {
    if (open) popoverRef.current?.scrollIntoView?.({ block: 'nearest' })
  }, [open])
  const hasMessage = Boolean(error ?? helperText)

  useEffect(() => {
    if (!open) return
    function closeOnOutsideClick(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [open])

  function close() {
    setOpen(false)
    triggerRef.current?.focus()
  }

  function choose(day: string | null) {
    onChange(day)
    close()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (open && event.key === 'Escape') {
      event.stopPropagation() // fecha só o calendário, não um modal em volta
      close()
    }
  }

  // Sair do campo com Tab também fecha o calendário.
  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    const next = event.relatedTarget
    if (next && !event.currentTarget.contains(next)) setOpen(false)
  }

  return (
    <FieldShell id={id} label={label} helperText={helperText} error={error} inverted={inverted}>
      <div ref={wrapperRef} className="relative" onKeyDown={handleKeyDown} onBlur={handleBlur}>
        <button
          ref={triggerRef}
          type="button"
          id={id}
          role="combobox"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={dialogId}
          aria-invalid={error ? true : undefined}
          aria-describedby={hasMessage ? getDescriptionId(id) : undefined}
          onClick={() => setOpen((current) => !current)}
          className={`flex h-12 items-center justify-between gap-2 text-left ${getControlStyles(error)}`}
        >
          <span className={value ? 'tabular' : 'text-gray-dim'}>
            {value ? formatDate(value) : placeholder}
          </span>
          <CalendarDays aria-hidden="true" size={20} className="shrink-0 text-red-ruby" />
        </button>

        {open && (
          <div
            ref={popoverRef}
            id={dialogId}
            role="dialog"
            aria-label={`Calendário: ${label}`}
            className="absolute left-0 z-10 mt-1 flex w-72 max-w-full flex-col gap-2 rounded-xs border border-beige-sand bg-white p-3 shadow-lg"
          >
            <Calendar value={value} min={min} max={max} onSelect={choose} />
            <div className="flex justify-between gap-2 border-t border-beige-sand pt-2">
              <Button variant="compact" disabled={!value} onClick={() => choose(null)}>
                Limpar
              </Button>
              <Button
                variant="compact"
                disabled={(min !== undefined && today < min) || (max !== undefined && today > max)}
                onClick={() => choose(today)}
              >
                Hoje
              </Button>
            </div>
          </div>
        )}
      </div>
    </FieldShell>
  )
}
