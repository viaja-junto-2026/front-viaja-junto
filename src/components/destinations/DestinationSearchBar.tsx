import { Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { paths } from '../../routes/paths'
import { destinationCategoryLabels } from '../../utils/labels'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'

const categoryOptions = [
  { value: '', label: 'Todas as categorias' },
  ...Object.entries(destinationCategoryLabels).map(([value, label]) => ({ value, label })),
]

/**
 * Barra de busca sobre fundo Bordô: leva ao catálogo com os filtros na URL
 * (`/destinations?q=...&category=...`).
 */
export function DestinationSearchBar() {
  const navigate = useNavigate()
  const [category, setCategory] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = String(new FormData(event.currentTarget).get('q') ?? '').trim()
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (category) params.set('category', category)
    const search = params.toString()
    void navigate(search ? `${paths.destinations}?${search}` : paths.destinations)
  }

  return (
    <form
      role="search"
      aria-label="Buscar destinos"
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-xs bg-red-burgundy p-4 shadow-lg sm:grid-cols-12 sm:items-end sm:p-6"
    >
      <div className="sm:col-span-5">
        <Input
          inverted
          label="Para onde?"
          name="q"
          type="search"
          placeholder="Ex.: Paris, Kyoto..."
        />
      </div>
      <div className="sm:col-span-4">
        <Select
          inverted
          label="Tipo de destino"
          options={categoryOptions}
          value={category}
          onChange={setCategory}
        />
      </div>
      <div className="sm:col-span-3">
        <Button
          type="submit"
          variant="light"
          fullWidth
          leftIcon={<Search aria-hidden="true" size={20} />}
        >
          Buscar destinos
        </Button>
      </div>
    </form>
  )
}
