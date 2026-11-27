import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../services/apiError'
import { DeleteTripSection } from './DeleteTripSection'

describe('DeleteTripSection', () => {
  it('asks for confirmation before deleting', async () => {
    const onDelete = vi.fn()
    render(<DeleteTripSection tripName="Floripa" onDelete={onDelete} />)

    await userEvent.click(screen.getByRole('button', { name: 'Excluir viagem' }))
    const dialog = screen.getByRole('dialog', { name: 'Excluir esta viagem?' })
    expect(dialog).toHaveTextContent('“Floripa”')
    expect(onDelete).not.toHaveBeenCalled()

    await userEvent.click(within(dialog).getByRole('button', { name: 'Excluir' }))

    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('shows the API error inside the dialog', async () => {
    render(
      <DeleteTripSection
        tripName="Floripa"
        error={ApiError.fromResponse(500)}
        onDelete={vi.fn()}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Excluir viagem' }))

    expect(within(screen.getByRole('dialog')).getByRole('alert')).toHaveTextContent(
      'O servidor está com problemas.',
    )
  })
})
