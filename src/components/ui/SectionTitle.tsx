import { Compass } from 'lucide-react'

type SectionTitleProps = {
  /** Linha pequena acima do título. */
  eyebrow: string
  title: string
}

/** Título centralizado de uma faixa editorial: linha pequena, serifa e um filete com bússola. */
export function SectionTitle({ eyebrow, title }: SectionTitleProps) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="text-label-overline text-red-ruby uppercase">{eyebrow}</p>
      <h2 className="font-display text-headline-lg font-normal text-red-burgundy">{title}</h2>
      <span aria-hidden="true" className="flex items-center gap-3 text-red-ruby">
        <span className="h-px w-12 bg-rose-vintage" />
        <Compass size={16} strokeWidth={1.5} />
        <span className="h-px w-12 bg-rose-vintage" />
      </span>
    </div>
  )
}
