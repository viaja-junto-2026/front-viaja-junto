import type { components } from '../services/generated/schema'

/** Metadados de paginação devolvidos pela API (page, limit, total, totalPages, hasNext, hasPrevious). */
export type PaginationMeta = components['schemas']['PaginationMetaDto']

/** Formato das listas paginadas da API: `{ data, meta }`. */
export type Paginated<TItem> = {
  data: TItem[]
  meta: PaginationMeta
}
