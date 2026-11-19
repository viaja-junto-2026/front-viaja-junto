import type { Destination } from '../services/destinations'

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
