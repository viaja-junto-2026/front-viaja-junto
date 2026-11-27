/** Lateral do picote: um bloco branco com um furo em meia-lua (transparente) do lado esquerdo. */
function Notch({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 32" className={`h-8 w-4 shrink-0 fill-white ${className ?? ''}`.trim()}>
      <path d="M0 0A16 16 0 0 1 0 32H16V0Z" />
    </svg>
  )
}

/**
 * Picote de um cartão de embarque, com um furo em cada lado. Vai entre dois blocos brancos,
 * dentro de um elemento com `drop-shadow`, para a sombra acompanhar o contorno dos furos.
 */
export function TicketPerforation() {
  return (
    // As margens de 1 px sobrepõem as peças: sem isso a sombra vaza pelas emendas.
    <div aria-hidden="true" className="-my-px flex h-8">
      <Notch />
      <div className="-mx-px flex flex-1 items-center bg-white px-4">
        <div className="flex-1 border-t-2 border-dashed border-beige-sand" />
      </div>
      <Notch className="rotate-180" />
    </div>
  )
}
