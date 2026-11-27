import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'
import { listDestinations } from '../services/destinations'
import type { DestinationCategory } from '../utils/labels'

/** Chave base de cache do catálogo de destinos. */
export const destinationsKey = ['destinations', 'catalog'] as const

const VALID_CATEGORIES = new Set<DestinationCategory>(['CITY', 'BEACH', 'NATURE', 'CULTURAL'])

export type DestinationFilters = {
  q?: string
  country?: string
  category?: DestinationCategory
}

type UseDestinationsOptions = {
  /** Quantos destinos exibir por página (padrão 12). */
  limit?: number
}

function parseCategory(raw: string | null): DestinationCategory | undefined {
  if (!raw) return undefined
  return VALID_CATEGORIES.has(raw as DestinationCategory) ? (raw as DestinationCategory) : undefined
}

function parsePage(raw: string | null): number {
  if (!raw) return 1
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1
}

function normalizeText(raw: string | null | undefined): string | undefined {
  const trimmed = raw?.trim()
  return trimmed ? trimmed : undefined
}

/**
 * Catálogo de destinos com filtros (`q`, `country`, `category`) e paginação (`page`)
 * sincronizados com a URL (`useSearchParams`), permitindo recarregar e compartilhar links.
 */
export function useDestinations({ limit = 12 }: UseDestinationsOptions = {}) {
  const [searchParams, setSearchParams] = useSearchParams()

  const q = normalizeText(searchParams.get('q'))
  const country = normalizeText(searchParams.get('country'))
  const category = parseCategory(searchParams.get('category'))
  const page = parsePage(searchParams.get('page'))

  const filters: DestinationFilters = { q, country, category }
  const hasActiveFilters = Boolean(q || country || category)

  const query = useQuery({
    queryKey: [...destinationsKey, { page, limit, q, country, category }],
    queryFn: () => listDestinations({ page, limit, q, country, category }),
    placeholderData: keepPreviousData,
  })

  function updateSearchParams(next: DestinationFilters & { page?: number }) {
    const params = new URLSearchParams()
    const nextQ = normalizeText(next.q)
    const nextCountry = normalizeText(next.country)

    if (nextQ) params.set('q', nextQ)
    if (nextCountry) params.set('country', nextCountry)
    if (next.category) params.set('category', next.category)
    if (next.page && next.page > 1) params.set('page', String(next.page))

    // Trocar filtro ou página não deve levar a rolagem para o topo.
    setSearchParams(params, { preventScrollReset: true })
  }

  function setFilters(changes: Partial<DestinationFilters>) {
    updateSearchParams({
      ...filters,
      ...changes,
      page: 1,
    })
  }

  function setPage(nextPage: number) {
    updateSearchParams({
      ...filters,
      page: Math.max(nextPage, 1),
    })
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams(), { preventScrollReset: true })
  }

  const items = query.data?.data ?? []
  const meta = query.data?.meta

  return {
    items,
    meta,
    page,
    limit,
    filters,
    hasActiveFilters,
    setFilters,
    setPage,
    clearFilters,
    hasNext: meta?.hasNext ?? false,
    hasPrevious: meta?.hasPrevious ?? false,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    isEmpty: !query.isLoading && !query.isError && items.length === 0,
    refetch: query.refetch,
  }
}
