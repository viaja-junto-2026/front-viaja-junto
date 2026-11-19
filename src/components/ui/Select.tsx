import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { FieldShell, type FieldProps } from './Field'
import { getControlStyles, getDescriptionId } from './fieldStyles'

export type SelectOption = {
  value: string
  label: string
  disabled?: boolean
}

export type SelectProps = FieldProps & {
  options: SelectOption[]
  /** Valor escolhido (modo controlado). Sem ele, o componente guarda o estado sozinho. */
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  /** Texto mostrado enquanto nada foi escolhido. */
  placeholder?: string
  /** Nome do campo: quando informado, o valor vai junto no envio de um `<form>`. */
  name?: string
  id?: string
  disabled?: boolean
  className?: string
}

/**
 * Lista suspensa própria (a lista nativa do navegador não aceita estilo): a lista abre na
 * largura do campo, com cantos arredondados e a opção em foco em Rosa Antigo.
 * Teclado: setas, Home e End movem; Enter ou espaço escolhem; Esc e Tab fecham.
 */
export function Select({
  label,
  helperText,
  error,
  options,
  value,
  defaultValue = '',
  onChange,
  placeholder = 'Selecione',
  name,
  id,
  disabled,
  className,
}: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const listboxId = `${selectId}-listbox`
  const [innerValue, setInnerValue] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const current = value ?? innerValue
  const selected = options.find((option) => option.value === current)
  const hasMessage = Boolean(error ?? helperText)

  useEffect(() => {
    if (!open) return
    function closeOnOutsideClick(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [open])

  function enabledIndex(from: number, step: 1 | -1): number {
    for (let i = from; i >= 0 && i < options.length; i += step) {
      if (!options[i].disabled) return i
    }
    return -1
  }

  function openList() {
    const selectedIndex = options.findIndex((option) => option.value === current)
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : Math.max(enabledIndex(0, 1), 0))
    setOpen(true)
  }

  function choose(index: number) {
    const option = options[index]
    if (!option || option.disabled) return
    setInnerValue(option.value)
    onChange?.(option.value)
    setOpen(false)
  }

  function move(index: number) {
    if (index >= 0) setActiveIndex(index)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const { key } = event
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(key)) {
        event.preventDefault()
        openList()
      }
      return
    }
    if (key === 'Escape') {
      event.preventDefault()
      event.stopPropagation() // fecha só a lista, não um modal em volta
      setOpen(false)
    } else if (key === 'Tab') {
      setOpen(false)
    } else if (key === 'ArrowDown') {
      event.preventDefault()
      move(enabledIndex(activeIndex + 1, 1))
    } else if (key === 'ArrowUp') {
      event.preventDefault()
      move(enabledIndex(activeIndex - 1, -1))
    } else if (key === 'Home') {
      event.preventDefault()
      move(enabledIndex(0, 1))
    } else if (key === 'End') {
      event.preventDefault()
      move(enabledIndex(options.length - 1, -1))
    } else if (key === 'Enter' || key === ' ') {
      event.preventDefault()
      choose(activeIndex)
    }
  }

  return (
    <FieldShell id={selectId} label={label} helperText={helperText} error={error}>
      <div ref={wrapperRef} className="relative">
        {name && <input type="hidden" name={name} value={current} />}
        <button
          type="button"
          id={selectId}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={open ? `${selectId}-option-${activeIndex}` : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={hasMessage ? getDescriptionId(selectId) : undefined}
          disabled={disabled}
          onClick={() => (open ? setOpen(false) : openList())}
          onKeyDown={handleKeyDown}
          className={`flex h-12 items-center justify-between gap-2 text-left ${getControlStyles(error)} ${className ?? ''}`.trim()}
        >
          <span className={selected ? '' : 'text-gray-dim'}>{selected?.label ?? placeholder}</span>
          <ChevronDown
            aria-hidden="true"
            size={20}
            className={`shrink-0 text-gray-dim transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>
        {open && (
          <ul
            id={listboxId}
            role="listbox"
            aria-label={label}
            // mantém o foco no campo ao clicar em uma opção
            onMouseDown={(event) => event.preventDefault()}
            className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-beige-sand bg-white p-1 shadow-lg"
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                id={`${selectId}-option-${index}`}
                role="option"
                aria-selected={option.value === current}
                aria-disabled={option.disabled || undefined}
                onClick={() => choose(index)}
                onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                className={`flex cursor-pointer items-center justify-between gap-2 rounded-sm px-3 py-2 text-body-md text-gray-ink ${
                  index === activeIndex ? 'bg-rose-vintage' : ''
                } ${option.disabled ? 'cursor-not-allowed opacity-50' : ''} ${
                  option.value === current ? 'font-semibold' : ''
                }`}
              >
                {option.label}
                {option.value === current && <Check aria-hidden="true" size={16} />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </FieldShell>
  )
}
