import type { Destination, DestinationDetails } from '../services/destinations'
import type { Paginated, PaginationMeta } from '../types/pagination'
import { makePublicReview } from './activities'
import { makePaginationMeta } from './reviews'

/** Destino do catálogo para os testes, com nota e foto por padrão. */
export function makeDestination(overrides: Partial<Destination> = {}): Destination {
  return {
    id: 'd1',
    name: 'Kyoto',
    country: 'Japão',
    countryCode: 'JP',
    category: 'CULTURAL',
    description: 'Antiga capital imperial.',
    latitude: 35.01,
    longitude: 135.76,
    photoUrl: 'https://img.test/kyoto.jpg',
    averageRating: 4.8,
    reviewCount: 12,
    ...overrides,
  }
}

/** Resposta paginada de destinos para os testes. */
export function makePaginatedDestinations(
  data: Destination[] = [makeDestination()],
  metaOverrides: Partial<PaginationMeta> = {},
): Paginated<Destination> {
  return {
    data,
    meta: makePaginationMeta({
      limit: 12,
      total: data.length,
      ...metaOverrides,
    }),
  }
}

/** Detalhes públicos de destino para os testes, com últimas avaliações por padrão. */
export function makeDestinationDetails(
  overrides: Partial<DestinationDetails> = {},
): DestinationDetails {
  return {
    id: 'd1',
    name: 'Paris',
    country: 'França',
    countryCode: 'FR',
    category: 'CITY',
    description: 'Capital da França, conhecida pelos museus e pela gastronomia.',
    latitude: 48.8566,
    longitude: 2.3522,
    photoUrl: 'https://img.test/paris.jpg',
    averageRating: 4.7,
    reviewCount: 38,
    latestReviews: [makePublicReview()],
    ...overrides,
  }
}
