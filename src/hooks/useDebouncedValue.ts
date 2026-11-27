import { useEffect, useState } from 'react'

/** Devolve o valor só depois de uma pausa na digitação, para não buscar a cada tecla. */
export function useDebouncedValue<TValue>(value: TValue, delayMs = 300): TValue {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
