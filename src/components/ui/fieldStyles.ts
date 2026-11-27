import { fieldFocus } from './focus'

/** Id do elemento que descreve o campo (ajuda ou erro), para `aria-describedby`. */
export function getDescriptionId(id: string): string {
  return `${id}-description`
}

/** Estilo base do controle (input, textarea e select): 48 px de altura nos campos de uma linha. */
const controlBase =
  'w-full rounded-xs border bg-white px-3 text-body-md text-gray-ink placeholder:text-gray-dim disabled:cursor-not-allowed disabled:opacity-50'

/** Classes do controle, com a borda Bordô quando há erro. */
export function getControlStyles(error: string | undefined): string {
  return `${controlBase} ${fieldFocus} ${error ? 'border-red-burgundy' : 'border-beige-sand'}`
}
