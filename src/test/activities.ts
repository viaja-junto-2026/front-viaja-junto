import type { ActivityDetails, PublicReview } from '../services/activities'

/** Avaliação pública para os testes (contém apenas o nome do autor). */
export function makePublicReview(overrides: Partial<PublicReview> = {}): PublicReview {
  return {
    id: 'r1',
    rating: 5,
    comment: 'Vale cada minuto da fila.',
    authorName: 'Gustavo Fidelis',
    createdAt: '2026-08-02T19:45:00.000Z',
    ...overrides,
  }
}

/** Detalhes de atividade do catálogo para os testes, com foto e nota por padrão. */
export function makeActivityDetails(overrides: Partial<ActivityDetails> = {}): ActivityDetails {
  return {
    id: 'a1',
    name: 'Museu do Louvre',
    description: 'Maior museu de arte do mundo.',
    type: 'TOUR',
    location: 'Rue de Rivoli, 75001',
    city: 'Paris',
    country: 'França',
    latitude: 48.860611,
    longitude: 2.337644,
    googlePlaceId: 'ChIJD3uTd9hx5kcR1IQvGfr8dbk',
    photoUrl: 'https://img.test/louvre.jpg',
    mapsUrl: 'https://maps.google.com/?cid=1234567890',
    source: 'MANUAL',
    averageRating: 4.6,
    reviewCount: 12,
    createdAt: '2026-02-01T12:00:00.000Z',
    destinationId: 'd1',
    latestReviews: [makePublicReview()],
    ...overrides,
  }
}
