import heroPhoto from '../../assets/hero-tokyo.webp'
import { useAuth } from '../../auth/useAuth'
import { Container } from '../../components/layout/Container'
import { ButtonLink } from '../../components/ui/ButtonLink'
import { paths } from '../../routes/paths'

/**
 * Hero em largura total. No desktop o texto fica sobre a foto, com um véu claro à esquerda
 * para a leitura; no celular a foto vem primeiro e o texto abaixo.
 */
export function HomeHero() {
  const { status } = useAuth()

  return (
    <section aria-labelledby="home-title" className="relative bg-white">
      <img
        src={heroPhoto}
        alt="Pagode vermelho entre cerejeiras em flor, com o Monte Fuji ao fundo ao entardecer"
        fetchPriority="high"
        className="h-72 w-full object-cover sm:h-96 lg:absolute lg:inset-0 lg:h-full"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-linear-to-r from-white/90 from-15% via-white/60 via-35% to-transparent to-60% lg:block"
      />
      <Container className="relative">
        <div className="flex max-w-lg flex-col items-start gap-5 py-10 lg:min-h-160 lg:justify-center lg:py-24">
          <p className="text-label-overline text-brown-espresso uppercase">
            Roteiro. Orçamento. Companhia.
          </p>
          <h1
            id="home-title"
            className="font-display text-display-hero-mobile text-brown-espresso lg:text-display-hero"
          >
            Sua viagem <span className="block text-red-ruby italic">começa aqui.</span>
          </h1>
          <p className="max-w-md text-body-lg text-gray-ink">
            Monte o roteiro com o seu grupo, controle o orçamento e divida as despesas em um só
            lugar.
          </p>
          <div className="flex min-h-12 flex-wrap items-center gap-3 pt-2">
            {status === 'authenticated' && (
              <ButtonLink to={paths.tripNew} variant="solid">
                Nova viagem
              </ButtonLink>
            )}
            {status === 'unauthenticated' && (
              <ButtonLink to={paths.login} variant="solid">
                Entrar
              </ButtonLink>
            )}
            <ButtonLink to={paths.destinations} variant="outline">
              Explorar destinos
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  )
}
