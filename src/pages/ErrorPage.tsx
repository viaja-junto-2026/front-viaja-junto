import { CircleAlert } from 'lucide-react'
import { ButtonLink } from '../components/ui/ButtonLink'
import { PageMessage } from '../components/ui/PageMessage'
import { paths } from '../routes/paths'

/** Mostrada quando uma rota quebra (erro inesperado ao renderizar). */
export default function ErrorPage() {
  return (
    <PageMessage
      alert
      icon={CircleAlert}
      title="Algo deu errado"
      description="Não foi possível mostrar esta página. Tente novamente em instantes."
      action={<ButtonLink to={paths.home}>Voltar para o início</ButtonLink>}
    />
  )
}
