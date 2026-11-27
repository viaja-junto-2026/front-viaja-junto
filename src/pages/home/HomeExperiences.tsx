import { Compass } from 'lucide-react'
import { ExperienceCard } from '../../components/activities/ExperienceCard'
import { EmptyState } from '../../components/feedback/EmptyState'
import { LoadingSkeleton } from '../../components/feedback/LoadingSkeleton'
import { QueryState } from '../../components/feedback/QueryState'
import { Container } from '../../components/layout/Container'
import { SectionTitle } from '../../components/ui/SectionTitle'
import { useActivities } from '../../hooks/useActivities'

const TITLE = 'Experiências para inspirar'

/** Quatro atividades do catálogo, das mais bem avaliadas para as demais. */
export function HomeExperiences() {
  const activities = useActivities({ initialFilters: { sort: 'rating' }, initialLimit: 4 })

  return (
    <section aria-label={TITLE} className="bg-white">
      <Container className="flex flex-col gap-10 py-16">
        <SectionTitle eyebrow="O que fazer" title={TITLE} />
        <QueryState
          isLoading={activities.isLoading}
          isError={activities.isError}
          isEmpty={activities.isEmpty}
          error={activities.error}
          onRetry={() => void activities.refetch()}
          loading={<LoadingSkeleton variant="card" count={4} label="Carregando experiências" />}
          empty={<EmptyState icon={Compass} title="Ainda não há atividades no catálogo" />}
        >
          <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {activities.items.map((activity) => (
              <li key={activity.id}>
                <ExperienceCard activity={activity} />
              </li>
            ))}
          </ul>
        </QueryState>
      </Container>
    </section>
  )
}
