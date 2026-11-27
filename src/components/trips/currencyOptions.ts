import type { SelectOption } from '../ui/Select'

const currencies: SelectOption[] = [
  { value: 'BRL', label: 'BRL (Real)' },
  { value: 'USD', label: 'USD (Dólar americano)' },
  { value: 'EUR', label: 'EUR (Euro)' },
  { value: 'GBP', label: 'GBP (Libra esterlina)' },
  { value: 'ARS', label: 'ARS (Peso argentino)' },
  { value: 'CLP', label: 'CLP (Peso chileno)' },
  { value: 'UYU', label: 'UYU (Peso uruguaio)' },
  { value: 'JPY', label: 'JPY (Iene)' },
]

/** Moedas oferecidas. Uma moeda salva fora da lista continua aparecendo. */
export function currencyOptions(current: string): SelectOption[] {
  return currencies.some((option) => option.value === current)
    ? currencies
    : [...currencies, { value: current, label: current }]
}
