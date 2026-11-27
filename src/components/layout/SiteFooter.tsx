import { Link } from 'react-router'
import { useAuth } from '../../auth/useAuth'
import { paths } from '../../routes/paths'
import { focusRing } from '../ui/focus'
import { Container } from './Container'

type FooterLink = { label: string; to: string }

const browseLinks: FooterLink[] = [
  { label: 'Início', to: paths.home },
  { label: 'Descobrir destinos', to: paths.destinations },
  { label: 'Minhas viagens', to: paths.trips },
]

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <nav aria-label={title} className="flex flex-col gap-3">
      <h2 className="text-label-sm text-beige-sand uppercase">{title}</h2>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.to}
              className={`text-body-sm text-white underline-offset-4 hover:underline ${focusRing}`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/** Rodapé em degradê (Bordô em cima, marrom embaixo), só com links para páginas que existem. */
export function SiteFooter() {
  const { status } = useAuth()
  const accountLinks: FooterLink[] =
    status === 'authenticated'
      ? [
          { label: 'Meu perfil', to: paths.profile },
          { label: 'Meus avisos', to: paths.notifications },
        ]
      : [{ label: 'Fazer login', to: paths.login }]

  return (
    <footer className="bg-linear-to-b from-red-burgundy to-brown-espresso pb-8 text-white">
      <Container className="grid gap-8 py-12 sm:grid-cols-4">
        <div className="flex flex-col gap-3 sm:col-span-2">
          <p className="font-display text-headline-lg font-normal">ViajaJunto</p>
          <p className="max-w-md text-body-sm">
            Planejamento de viagens em grupo: roteiro, orçamento, despesas e lugares avaliados por
            quem já foi.
          </p>
        </div>
        <FooterColumn title="Navegar" links={browseLinks} />
        <FooterColumn title="Conta" links={accountLinks} />
      </Container>
      <Container className="border-t border-white/20 pt-6">
        <p className="text-body-sm">ViajaJunto, um projeto acadêmico.</p>
      </Container>
    </footer>
  )
}
