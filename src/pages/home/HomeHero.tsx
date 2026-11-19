import { Star } from 'lucide-react'
import { Link } from 'react-router'
import heroPhoto from '../../assets/hero-tokyo.webp'
import { useAuth } from '../../auth/useAuth'
import { FloatingCard } from '../../components/ui/Card'
import { ButtonLink } from '../../components/ui/ButtonLink'
import { useTopDestinations } from '../../hooks/useTopDestinations'
import { paths } from '../../routes/paths'
import { formatRating } from '../../utils/format'

/**
 * Hero da home. No celular a foto vem primeiro e o texto abaixo; no desktop a foto fica à
 * esquerda (7 colunas) e o texto à direita (5 colunas). O cartão sobre a foto mostra o
 * destino mais bem avaliado do catálogo, quando já existe algum.
 */
export function HomeHero() {
  const { status } = useAuth()
  const { data } = useTopDestinations()
  const featured = data?.[0]

  return (
    <section
      aria-labelledby="home-title"
      className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8"
    >
      <div className="relative lg:col-span-7">
        <div
          aria-hidden="true"
          className="absolute -bottom-4 -left-4 hidden size-full rounded-organic bg-beige-sand lg:block"
        />
        <img
          src={heroPhoto}
          alt="Pagode vermelho entre cerejeiras em flor, com o Monte Fuji ao fundo ao entardecer"
          fetchPriority="high"
          className="relative h-72 w-full rounded-tl-organic rounded-tr-xl rounded-br-organic rounded-bl-xl object-cover sm:h-96 lg:h-128"
        />
        {featured && (
          <FloatingCard
            as="article"
            className="absolute right-4 -bottom-8 left-4 sm:left-auto sm:w-72 lg:-right-6"
          >
            <Link
              to={paths.destinationDetails(featured.id)}
              className="flex items-center justify-between gap-4"
            >
              <span className="flex flex-col">
                <span className="text-label-sm text-red-burgundy uppercase">Mais bem avaliado</span>
                <span className="text-title-md text-gray-ink">{featured.name}</span>
                {featured.country && (
                  <span className="text-body-sm text-gray-dim">{featured.country}</span>
                )}
              </span>
              {featured.averageRating !== null && (
                <span className="flex items-center gap-1 text-label-lg text-gray-ink">
                  <Star
                    aria-hidden="true"
                    size={20}
                    className="text-red-ruby"
                    fill="currentColor"
                  />
                  <span className="tabular">{formatRating(featured.averageRating)}</span>
                </span>
              )}
            </Link>
          </FloatingCard>
        )}
      </div>

      <div className="flex flex-col items-start gap-6 pt-6 lg:col-span-5 lg:pt-0 lg:pl-8">
        <p className="text-label-overline text-red-burgundy uppercase">Planejamento em grupo</p>
        <h1
          id="home-title"
          className="font-display text-display-hero-mobile text-red-burgundy lg:text-display-hero"
        >
          Sua viagem <span className="block text-red-ruby italic">começa aqui.</span>
        </h1>
        <p className="max-w-md text-body-lg text-gray-dim">
          Monte o roteiro com o seu grupo, controle o orçamento e divida as despesas em um só lugar.
        </p>
        {status === 'authenticated' && (
          <ButtonLink to={paths.tripNew} variant="pill">
            Nova viagem
          </ButtonLink>
        )}
        {status === 'unauthenticated' && (
          <ButtonLink to={paths.login} variant="pill">
            Entrar
          </ButtonLink>
        )}
        {status === 'loading' && <div aria-hidden="true" className="h-14" />}
      </div>
    </section>
  )
}
