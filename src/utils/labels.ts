import type { components } from '../services/generated/schema'

/**
 * Nomes de domínio traduzidos para a interface. Os valores vêm da API em inglês
 * (`BEACH`, `PLANNING`...); as telas sempre mostram estes textos em português.
 */

type Schemas = components['schemas']

export type TripStatus = Schemas['TripResponseDto']['status']
export type DestinationCategory = NonNullable<Schemas['DestinationCatalogResponseDto']['category']>
export type ActivityType = Schemas['ActivityCatalogResponseDto']['type']
export type MemberRole = Schemas['TripResponseDto']['role']

export const tripStatusLabels: Record<TripStatus, string> = {
  PLANNING: 'Planejando',
  CONFIRMED: 'Confirmada',
  COMPLETED: 'Concluída',
}

export type ActivityStatus = Schemas['TripActivityResponseDto']['status']

export const activityStatusLabels: Record<ActivityStatus, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmada',
  COMPLETED: 'Concluída',
}

export const destinationCategoryLabels: Record<DestinationCategory, string> = {
  CITY: 'Cidade',
  BEACH: 'Praia',
  NATURE: 'Natureza',
  CULTURAL: 'Cultural',
}

export const activityTypeLabels: Record<ActivityType, string> = {
  TOUR: 'Passeio',
  FOOD: 'Comida',
  LODGING: 'Hospedagem',
  TRANSPORT: 'Transporte',
  OTHER: 'Outros',
}

export const memberRoleLabels: Record<MemberRole, string> = {
  OWNER: 'Criador',
  EDITOR: 'Editor',
  VIEWER: 'Visualizador',
}
