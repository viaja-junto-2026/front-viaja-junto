import { describe, expect, it } from 'vitest'
import {
  activityTypeLabels,
  destinationCategoryLabels,
  memberRoleLabels,
  tripStatusLabels,
} from './labels'

describe('domain labels', () => {
  it('translates the trip status', () => {
    expect(tripStatusLabels).toEqual({
      PLANNING: 'Planejando',
      CONFIRMED: 'Confirmada',
      COMPLETED: 'Concluída',
    })
  })

  it('translates the destination categories', () => {
    expect(destinationCategoryLabels).toEqual({
      CITY: 'Cidade',
      BEACH: 'Praia',
      NATURE: 'Natureza',
      CULTURAL: 'Cultural',
    })
  })

  it('translates the activity types', () => {
    expect(activityTypeLabels).toEqual({
      TOUR: 'Passeio',
      FOOD: 'Comida',
      LODGING: 'Hospedagem',
      TRANSPORT: 'Transporte',
      OTHER: 'Outros',
    })
  })

  it('translates the member roles', () => {
    expect(memberRoleLabels).toEqual({
      OWNER: 'Criador',
      EDITOR: 'Editor',
      VIEWER: 'Visualizador',
    })
  })
})
