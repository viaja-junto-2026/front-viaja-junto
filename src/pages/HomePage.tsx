import heroPhoto from '../assets/hero-tokyo.webp'
import { useAuth } from '../auth/useAuth'
import { DestinationSearchBar } from '../components/destinations/DestinationSearchBar'
import { Container } from '../components/layout/Container'
import { SiteFooter } from '../components/layout/SiteFooter'
import { ButtonLink } from '../components/ui/ButtonLink'
import { PromoBanner } from '../components/ui/PromoBanner'
import { paths } from '../routes/paths'
import { HomeExperiences } from './home/HomeExperiences'
import { HomeFeatures } from './home/HomeFeatures'
import { HomeHero } from './home/HomeHero'
import { TopDestinationsSection } from './home/TopDestinationsSection'

/** Home pública, em faixas de largura total (a rota é marcada com `fullBleed`). */
export default function HomePage() {
  const { status } = useAuth()
  const isSignedIn = status === 'authenticated'

  return (
    <>
      <HomeHero />
      <div className="border-b border-beige-sand bg-white">
        <Container className="relative z-10 pt-6 lg:-mt-12 lg:pt-0">
          <DestinationSearchBar />
        </Container>
        <HomeFeatures />
      </div>
      <TopDestinationsSection />
      <HomeExperiences />
      <PromoBanner
        title="Planeje a próxima viagem"
        text="Crie o roteiro, chame o grupo com um código e acompanhem tudo juntos."
        image={heroPhoto}
        action={
          <ButtonLink to={isSignedIn ? paths.tripNew : paths.login} variant="light">
            {isSignedIn ? 'Planejar viagem' : 'Começar agora'}
          </ButtonLink>
        }
      />
      <SiteFooter />
    </>
  )
}
