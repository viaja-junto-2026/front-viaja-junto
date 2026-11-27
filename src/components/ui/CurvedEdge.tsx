/**
 * Borda direita em curva, para uma foto encostar em uma coluna `beige-light` sem corte reto.
 * Vai dentro de um bloco `relative`: a onda Rosa Antigo acompanha a onda do fundo.
 */
export function CurvedEdge() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 1000"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-y-0 -right-px h-full w-32"
    >
      <path className="fill-rose-vintage/70" d="M96 0H62C8 150 4 330 44 500S78 850 6 1000H96Z" />
      <path className="fill-beige-light" d="M100 0H82C34 170 28 330 68 500S100 840 40 1000H100Z" />
    </svg>
  )
}
