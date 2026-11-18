/**
 * Único lugar onde os caminhos do app são definidos.
 * Use `paths` para navegar (links, redirects) e `patterns` para declarar as rotas.
 */
export const paths = {
  home: '/',
  login: '/login',
  authCallback: '/auth/callback',
  destinations: '/destinations',
  destinationDetails: (id: string) => `/destinations/${id}`,
  activityDetails: (id: string) => `/activities/${id}`,
  trips: '/trips',
  tripNew: '/trips/new',
  tripDetails: (id: string) => `/trips/${id}`,
  tripEdit: (id: string) => `/trips/${id}/edit`,
  join: '/join',
  reviews: '/reviews',
  notifications: '/notifications',
  profile: '/profile',
} as const

/** Padrões usados na declaração das rotas (com parâmetros). */
export const patterns = {
  destinationDetails: '/destinations/:id',
  activityDetails: '/activities/:id',
  tripDetails: '/trips/:id',
  tripEdit: '/trips/:id/edit',
} as const
