import { Link } from 'react-router'
import { paths } from '../routes/paths'

/** Mostrada quando uma rota quebra (erro inesperado ao renderizar). */
export default function ErrorPage() {
  return (
    <section role="alert" className="py-8">
      <h1 className="text-headline-lg text-red-burgundy">Algo deu errado</h1>
      <p className="mt-2 text-body-md text-gray-dim">
        Não foi possível mostrar esta página. Tente novamente em instantes.
      </p>
      <Link to={paths.home} className="mt-6 inline-block text-label-lg text-red-ruby underline">
        Voltar para o início
      </Link>
    </section>
  )
}
