import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './Button'

type PaginationProps = {
  /** Nome da navegação para leitores de tela, por exemplo "Paginação dos destinos". */
  label: string
  page: number
  totalPages?: number
  hasPrevious: boolean
  hasNext: boolean
  /** Bloqueia os botões enquanto uma página carrega. */
  busy?: boolean
  onPageChange: (page: number) => void
}

/** Navegação entre páginas de uma lista. Não aparece quando há uma página só. */
export function Pagination({
  label,
  page,
  totalPages,
  hasPrevious,
  hasNext,
  busy = false,
  onPageChange,
}: PaginationProps) {
  if ((totalPages ?? 1) <= 1 && !hasPrevious && !hasNext) return null

  return (
    <nav aria-label={label} className="flex flex-wrap items-center justify-between gap-4">
      <Button
        variant="secondary"
        disabled={!hasPrevious || busy}
        leftIcon={<ChevronLeft aria-hidden="true" size={20} />}
        onClick={() => onPageChange(page - 1)}
      >
        Anterior
      </Button>
      <span aria-live="polite" className="text-body-sm text-gray-dim tabular">
        Página {page}
        {totalPages ? ` de ${totalPages}` : ''}
      </span>
      <Button
        variant="secondary"
        disabled={!hasNext || busy}
        rightIcon={<ChevronRight aria-hidden="true" size={20} />}
        onClick={() => onPageChange(page + 1)}
      >
        Próxima
      </Button>
    </nav>
  )
}
