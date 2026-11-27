import { Compass } from 'lucide-react'

/** Filete com bússola, o ornamento que fica junto dos títulos centralizados. */
export function CompassDivider() {
  return (
    <span aria-hidden="true" className="flex items-center gap-3 text-red-ruby">
      <span className="h-px w-12 bg-rose-vintage" />
      <Compass size={16} strokeWidth={1.5} />
      <span className="h-px w-12 bg-rose-vintage" />
    </span>
  )
}
