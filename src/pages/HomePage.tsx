import { HomeFeatures } from './home/HomeFeatures'
import { HomeHero } from './home/HomeHero'
import { TopDestinationsSection } from './home/TopDestinationsSection'

/** Home pública: hero do produto, pontos fortes e os destinos mais bem avaliados. */
export default function HomePage() {
  return (
    <div className="flex flex-col gap-16 py-8 lg:gap-20 lg:py-10">
      <HomeHero />
      <HomeFeatures />
      <TopDestinationsSection />
    </div>
  )
}
