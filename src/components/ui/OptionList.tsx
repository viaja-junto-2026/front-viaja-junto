import { ChevronRight } from 'lucide-react'
import { focusRing } from './focus'

export type Option = {
  id: string
  title: string
  subtitle?: string
}

type OptionListProps = {
  /** Nome da lista para leitores de tela, por exemplo "Destinos encontrados". */
  label: string
  options: Option[]
  onSelect: (id: string) => void
}

/** Lista de resultados para escolher um item: cada linha inteira é clicável. */
export function OptionList({ label, options, onSelect }: OptionListProps) {
  return (
    <ul aria-label={label} className="flex flex-col rounded-xs border border-beige-sand">
      {options.map(({ id, title, subtitle }) => (
        <li key={id} className="border-b border-beige-sand last:border-b-0">
          <button
            type="button"
            onClick={() => onSelect(id)}
            className={`flex min-h-12 w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-beige-light ${focusRing}`}
          >
            <span className="flex min-w-0 flex-col">
              <span className="text-label-md text-gray-ink">{title}</span>
              {subtitle && <span className="text-body-sm text-gray-dim">{subtitle}</span>}
            </span>
            <ChevronRight aria-hidden="true" size={20} className="shrink-0 text-red-ruby" />
          </button>
        </li>
      ))}
    </ul>
  )
}
