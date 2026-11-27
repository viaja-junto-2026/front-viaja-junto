import { Check, type LucideIcon } from 'lucide-react'
import { focusRing } from './focus'

export type StatFilterOption = {
  id: string
  label: string
  icon: LucideIcon
  /** Quantos itens há nesta opção; sem valor (carregando ou erro), aparece um travessão. */
  count?: number
}

type StatFilterProps = {
  /** Nome do grupo para leitores de tela, por exemplo "Filtrar por status". */
  label: string
  options: StatFilterOption[]
  value: string
  onChange: (id: string) => void
}

/**
 * Filtro que também é resumo: uma escolha entre poucas opções, cada uma com a quantidade
 * de itens. Vai dentro da caixa marrom (`FilterPanel`); no celular vira uma grade 2 x 2.
 */
export function StatFilter({ label, options, value, onChange }: StatFilterProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className="mx-auto grid w-fit max-w-full grid-cols-2 gap-2 lg:w-full lg:grid-cols-4"
    >
      {options.map(({ id, label: optionLabel, icon: Icon, count }) => {
        const selected = id === value

        return (
          <button
            key={id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(id)}
            className={`flex items-center gap-2 rounded-xs px-3 py-3 text-left transition-colors sm:gap-3 sm:px-5 lg:justify-center lg:px-3 ${
              selected ? 'bg-beige-light text-brown-espresso' : 'text-white hover:bg-white/10'
            } ${focusRing}`}
          >
            <Icon
              aria-hidden="true"
              size={28}
              strokeWidth={1.5}
              className={`size-6 shrink-0 sm:size-7 ${selected ? 'text-red-ruby' : 'text-rose-vintage'}`}
            />
            <span className="flex min-w-0 flex-col">
              <span className="text-numeric-lg tabular">{count ?? '–'}</span>
              <span className="flex items-center gap-1 text-label-md">
                {optionLabel}
                {/* O espaço do check fica sempre reservado, para a grade não se mexer ao escolher. */}
                <Check
                  aria-hidden="true"
                  size={16}
                  className={`shrink-0 ${selected ? '' : 'invisible'}`}
                />
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
