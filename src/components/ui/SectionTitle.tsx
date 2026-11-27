import { CompassDivider } from './CompassDivider'
import { DisplayTitle } from './DisplayTitle'

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
      <DisplayTitle as="h2">{title}</DisplayTitle>
      <CompassDivider />
    </div>
  )
}
