import { ArrowRight } from 'lucide-react'

/** Círculo branco com seta, que fecha o botão em pílula (`pill`), como no hero. */
export function ArrowCircle() {
  return (
    <span className="flex size-9 items-center justify-center rounded-full bg-white text-red-ruby">
      <ArrowRight aria-hidden="true" size={20} />
    </span>
  )
}
