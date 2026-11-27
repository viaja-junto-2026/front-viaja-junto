import { MapPinOff } from 'lucide-react'
import { ButtonLink } from '../components/ui/ButtonLink'
import { PageMessage } from '../components/ui/PageMessage'
import { paths } from '../routes/paths'

export default function NotFoundPage() {
  return (
    <PageMessage
      icon={MapPinOff}
      title="Página não encontrada"
      description="O endereço que você abriu não existe ou foi movido."
      action={<ButtonLink to={paths.home}>Voltar para o início</ButtonLink>}
    />
  )
}
