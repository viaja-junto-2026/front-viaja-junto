import { MapPin } from 'lucide-react'

/** Localização com o alfinete Rubi, nos topos das páginas de detalhe. */
export function LocationLine({ children }: { children: string }) {
  return (
    <p className="flex items-center gap-2 text-body-md text-gray-dim">
      <MapPin aria-hidden="true" size={20} className="shrink-0 text-red-ruby" />
      <span>{children}</span>
    </p>
  )
}
