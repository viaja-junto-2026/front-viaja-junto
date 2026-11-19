import { Star, Users, Wallet, type LucideIcon } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { IconCircle } from '../../components/ui/IconCircle'

type Feature = {
  icon: LucideIcon
  tone: 'sand' | 'wheat' | 'mist'
  title: string
  text: string
}

const features: Feature[] = [
  {
    icon: Users,
    tone: 'sand',
    title: 'Planeje junto',
    text: 'Convide o grupo com um código e monte o roteiro em conjunto.',
  },
  {
    icon: Wallet,
    tone: 'wheat',
    title: 'Controle o orçamento',
    text: 'Veja o total, o saldo e o gasto por categoria, sem planilha.',
  },
  {
    icon: Star,
    tone: 'mist',
    title: 'Descubra lugares',
    text: 'Destinos e atividades avaliados por quem já viajou.',
  },
]

/** Faixa com os três pontos fortes do produto. */
export function HomeFeatures() {
  return (
    <Card as="section" aria-label="Como o ViajaJunto ajuda" className="rounded-xl">
      <ul className="grid gap-6 sm:grid-cols-3">
        {features.map(({ icon, tone, title, text }) => (
          <li key={title} className="flex items-start gap-4">
            <IconCircle icon={icon} tone={tone} />
            <div className="flex flex-col gap-1">
              <h3 className="text-title-md text-gray-ink">{title}</h3>
              <p className="text-body-sm text-gray-dim">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
