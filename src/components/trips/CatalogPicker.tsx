import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import type { Paginated } from '../../types/pagination'
import { getErrorMessage } from '../../utils/errorMessages'
import { ErrorState } from '../feedback/ErrorState'
import { LoadingSkeleton } from '../feedback/LoadingSkeleton'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { OptionList, type Option } from '../ui/OptionList'

/** Quantos resultados a busca mostra: o suficiente para escolher sem rolar muito. */
export const PICKER_LIMIT = 6

type CatalogPickerProps<TItem extends { id: string }> = {
  /** Rótulo do campo de busca. */
  label: string
  placeholder: string
  /** Identifica a busca no cache; o texto digitado é acrescentado. */
  queryKey: readonly unknown[]
  search: (q: string | undefined) => Promise<Paginated<TItem>>
  describe: (item: TItem) => Omit<Option, 'id'>
  selected: TItem | null
  onSelect: (item: TItem | null) => void
  /** Erro quando se tenta salvar sem escolher. */
  error?: string
}

/** Busca no catálogo e escolhe um item. Depois da escolha, mostra o item e o "Trocar". */
export function CatalogPicker<TItem extends { id: string }>({
  label,
  placeholder,
  queryKey,
  search,
  describe,
  selected,
  onSelect,
  error,
}: CatalogPickerProps<TItem>) {
  const [text, setText] = useState('')
  const q = useDebouncedValue(text.trim()) || undefined
  const results = useQuery({
    queryKey: [...queryKey, q],
    queryFn: () => search(q),
    placeholderData: keepPreviousData,
    enabled: !selected,
  })

  if (selected) {
    const { title, subtitle } = describe(selected)
    return (
      <div className="flex items-center justify-between gap-3 rounded-xs border border-beige-sand bg-beige-light p-3">
        <div className="min-w-0">
          <p className="text-label-md text-gray-ink">{title}</p>
          {subtitle && <p className="text-body-sm text-gray-dim">{subtitle}</p>}
        </div>
        <Button variant="compact" onClick={() => onSelect(null)}>
          Trocar
        </Button>
      </div>
    )
  }

  const items = results.data?.data ?? []

  return (
    <div className="flex flex-col gap-3">
      <Input
        label={label}
        type="search"
        autoComplete="off"
        placeholder={placeholder}
        value={text}
        error={error}
        onChange={(event) => setText(event.target.value)}
        // Enter na busca não pode enviar o formulário.
        onKeyDown={(event) => event.key === 'Enter' && event.preventDefault()}
      />
      {results.isLoading ? (
        <LoadingSkeleton variant="text" count={3} label="Buscando no catálogo" />
      ) : results.isError ? (
        <ErrorState
          message={getErrorMessage(results.error)}
          onRetry={() => void results.refetch()}
        />
      ) : items.length === 0 ? (
        <p role="status" className="text-body-sm text-gray-dim">
          Nada encontrado no catálogo. Tente outro nome.
        </p>
      ) : (
        <OptionList
          label="Resultados do catálogo"
          options={items.map((item) => ({ id: item.id, ...describe(item) }))}
          onSelect={(id) => onSelect(items.find((item) => item.id === id) ?? null)}
        />
      )}
    </div>
  )
}
