import { Receipt, Route, Star, Wallet, type LucideIcon } from 'lucide-react'
import { Container } from '../../components/layout/Container'

type Feature = {
  icon: LucideIcon
  title: string
  text: string
}

const features: Feature[] = [
  { icon: Route, title: 'Roteiro em grupo', text: 'Destinos e atividades montados por todos.' },
  { icon: Wallet, title: 'Orçamento claro', text: 'Total, planejado e saldo em um só lugar.' },
  { icon: Receipt, title: 'Despesas divididas', text: 'Cada um sabe quanto deve a quem.' },
  { icon: Star, title: 'Lugares avaliados', text: 'Notas de quem já esteve lá.' },
]

/** Faixa dos pontos fortes: ícones de linha separados por filetes, sem cards. */
export function HomeFeatures() {
  return (
    <section aria-label="Como o ViajaJunto ajuda">
      <Container className="py-12">
        <ul className="grid grid-cols-2 gap-y-10 lg:grid-cols-4 lg:divide-x lg:divide-beige-sand">
          {features.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex flex-col items-center gap-3 px-4 text-center">
              <Icon
                aria-hidden="true"
                size={36}
                strokeWidth={1.25}
                className="text-brown-espresso"
              />
              <h3 className="text-label-sm text-brown-espresso uppercase">{title}</h3>
              <p className="max-w-3xs text-body-sm text-gray-dim">{text}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
