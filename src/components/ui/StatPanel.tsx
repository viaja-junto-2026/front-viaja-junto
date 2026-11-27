import type { LucideIcon } from 'lucide-react'

export type Stat = {
  label: string
  /** O número ou o texto em destaque. */
  value: string | number
  icon: LucideIcon
}

/**
 * Resumo em 4 partes dentro da caixa marrom (`FilterPanel`). No celular é uma grade 2 x 2
 * centralizada, com colunas da mesma largura: os ícones ficam um embaixo do outro.
 */
export function StatPanel({ label, stats }: { label: string; stats: Stat[] }) {
  return (
    <dl
      aria-label={label}
      className="mx-auto grid w-fit max-w-full grid-cols-2 gap-x-8 gap-y-2 lg:w-full lg:gap-x-2 lg:grid-cols-4"
    >
      {stats.map(({ label: statLabel, value, icon: Icon }) => (
        <div
          key={statLabel}
          className="flex items-center gap-2 py-2 text-white sm:gap-3 lg:justify-center lg:px-2"
        >
          <Icon
            aria-hidden="true"
            size={28}
            strokeWidth={1.5}
            className="size-6 shrink-0 text-rose-vintage sm:size-7"
          />
          {/* O nome vem antes para leitores de tela; na tela, o valor fica em cima. */}
          <div className="flex min-w-0 flex-col-reverse">
            <dt className="text-label-md text-beige-sand">{statLabel}</dt>
            {/* Um texto, como o papel da pessoa, fica menor no celular para caber na coluna. */}
            <dd
              className={`tabular ${typeof value === 'number' ? 'text-numeric-lg' : 'text-numeric-md sm:text-numeric-lg'}`}
            >
              {value}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  )
}
