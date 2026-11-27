import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import {
  addDays,
  addMonths,
  formatLongDate,
  formatMonthTitle,
  monthWeeks,
  todayIso,
  weekDay,
} from '../../utils/calendar'
import { focusRing } from './focus'
import { IconButton } from './IconButton'

const WEEK_DAYS = [
  ['D', 'domingo'],
  ['S', 'segunda-feira'],
  ['T', 'terça-feira'],
  ['Q', 'quarta-feira'],
  ['Q', 'quinta-feira'],
  ['S', 'sexta-feira'],
  ['S', 'sábado'],
]

type CalendarProps = {
  /** Dia escolhido (`AAAA-MM-DD`). */
  value: string | null
  /** Primeiro dia que pode ser escolhido. */
  min?: string
  onSelect: (day: string) => void
}

function dayStyle(selected: boolean, today: boolean): string {
  if (selected) return 'bg-red-burgundy text-white'
  const border = today ? 'border border-red-ruby' : ''
  return `text-gray-ink enabled:hover:bg-beige-sand ${border}`
}

/**
 * Calendário de um mês. Teclado: setas andam por dia e por semana, Home e End vão para o
 * começo e o fim da semana, PageUp e PageDown trocam de mês (com Shift, de ano).
 */
export function Calendar({ value, min, onSelect }: CalendarProps) {
  const titleId = useId()
  const today = todayIso()
  // Dia que recebe o foco; ele também define o mês mostrado.
  const [active, setActive] = useState(() => value ?? (min && min > today ? min : today))
  const gridRef = useRef<HTMLTableElement>(null)
  // O foco só acompanha o dia ao abrir e no teclado, não ao usar as setas do cabeçalho.
  const focusActive = useRef(true)

  useEffect(() => {
    if (!focusActive.current) return
    focusActive.current = false
    gridRef.current?.querySelector<HTMLElement>(`[data-day="${active}"]`)?.focus()
  }, [active])

  function showMonth(months: number) {
    setActive(addMonths(active, months))
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTableElement>) {
    const year = event.shiftKey ? 12 : 1
    const moves: Record<string, () => string> = {
      ArrowLeft: () => addDays(active, -1),
      ArrowRight: () => addDays(active, 1),
      ArrowUp: () => addDays(active, -7),
      ArrowDown: () => addDays(active, 7),
      Home: () => addDays(active, -weekDay(active)),
      End: () => addDays(active, 6 - weekDay(active)),
      PageUp: () => addMonths(active, -year),
      PageDown: () => addMonths(active, year),
    }
    const move = moves[event.key]
    if (!move) return

    event.preventDefault()
    focusActive.current = true
    setActive(move())
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <IconButton label="Mês anterior" variant="ghost" size="sm" onClick={() => showMonth(-1)}>
          <ChevronLeft aria-hidden="true" size={20} />
        </IconButton>
        <p id={titleId} aria-live="polite" className="text-title-md text-brown-espresso">
          {formatMonthTitle(active)}
        </p>
        <IconButton label="Próximo mês" variant="ghost" size="sm" onClick={() => showMonth(1)}>
          <ChevronRight aria-hidden="true" size={20} />
        </IconButton>
      </div>

      <table
        ref={gridRef}
        role="grid"
        aria-labelledby={titleId}
        onKeyDown={handleKeyDown}
        className="w-full table-fixed border-collapse"
      >
        <thead>
          <tr>
            {WEEK_DAYS.map(([short, long]) => (
              <th key={long} scope="col" abbr={long} className="h-8 text-label-sm text-gray-dim">
                {short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {monthWeeks(active).map((week, weekIndex) => (
            <tr key={weekIndex}>
              {week.map((day, index) => (
                <td key={day ?? index} aria-selected={day ? day === value : undefined}>
                  {day ? (
                    <button
                      type="button"
                      data-day={day}
                      tabIndex={day === active ? 0 : -1}
                      aria-label={formatLongDate(day)}
                      aria-current={day === today ? 'date' : undefined}
                      disabled={min !== undefined && day < min}
                      onClick={() => onSelect(day)}
                      className={`h-9 w-full rounded-xs text-body-sm tabular transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${dayStyle(day === value, day === today)} ${focusRing}`}
                    >
                      {Number(day.slice(8))}
                    </button>
                  ) : (
                    <span className="block h-9" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
