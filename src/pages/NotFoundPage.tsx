import { Link } from 'react-router'
import { paths } from '../routes/paths'

export default function NotFoundPage() {
  return (
    <section className="py-8">
      <h1 className="text-headline-lg text-red-burgundy">Página não encontrada</h1>
      <p className="mt-2 text-body-md text-gray-dim">
        O endereço que você abriu não existe ou foi movido.
      </p>
      <Link to={paths.home} className="mt-6 inline-block text-label-lg text-red-ruby underline">
        Voltar para o início
      </Link>
    </section>
  )
}
