import { keepPreviousData, useQuery, type QueryKey } from '@tanstack/react-query'
import { useState } from 'react'
import type { Paginated } from '../types/pagination'

type Filters = Record<string, string | number | boolean | undefined>

type UsePaginatedQueryOptions<TItem, TFilters extends Filters> = {
  /** Identifica a busca no cache, por exemplo `['trips']`. Página e filtros são acrescentados. */
  queryKey: QueryKey
  /** Função de serviço: recebe `page`, `limit` e os filtros e devolve `{ data, meta }`. */
  queryFn: (params: { page: number; limit: number } & TFilters) => Promise<Paginated<TItem>>
  initialFilters?: TFilters
  initialPage?: number
  initialLimit?: number
  enabled?: boolean
}

/**
 * Lista paginada com filtros, compatível com o `{ data, meta }` da API.
 * Mudar um filtro ou o tamanho da página volta para a página 1, e a página anterior
 * continua na tela enquanto a nova carrega (sem piscar o skeleton).
 */
export function usePaginatedQuery<TItem, TFilters extends Filters = Filters>({
  queryKey,
  queryFn,
  initialFilters,
  initialPage = 1,
  initialLimit = 10,
  enabled = true,
}: UsePaginatedQueryOptions<TItem, TFilters>) {
  const [page, setPage] = useState(initialPage)
  const [limit, setLimitState] = useState(initialLimit)
  const [filters, setFiltersState] = useState<TFilters>(initialFilters ?? ({} as TFilters))

  const query = useQuery({
    queryKey: [...queryKey, { page, limit, filters }],
    queryFn: () => queryFn({ page, limit, ...filters }),
    placeholderData: keepPreviousData,
    enabled,
  })

  const items = query.data?.data ?? []
  const meta = query.data?.meta

  return {
    items,
    meta,
    page,
    limit,
    filters,
    /** Vai para a página indicada. */
    setPage,
    /** Troca o tamanho da página e volta para a primeira. */
    setLimit: (nextLimit: number) => {
      setLimitState(nextLimit)
      setPage(1)
    },
    /** Atualiza só os filtros informados e volta para a primeira página. */
    setFilters: (changes: Partial<TFilters>) => {
      setFiltersState((current) => ({ ...current, ...changes }))
      setPage(1)
    },
    hasNext: meta?.hasNext ?? false,
    hasPrevious: meta?.hasPrevious ?? false,
    /** Carregando pela primeira vez (ainda não há dados para mostrar). */
    isLoading: query.isLoading,
    /** Qualquer chamada em andamento, inclusive troca de página. */
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    /** Sem erro, sem carregar e sem nenhum item. */
    isEmpty: !query.isLoading && !query.isError && items.length === 0,
    refetch: query.refetch,
  }
}
