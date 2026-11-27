import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../services/apiError'
import type { TripInput } from '../../services/trips'
import { currencyOptions } from './currencyOptions'
import { TripForm } from './TripForm'
import { emptyTrip } from './tripFormValues'

function renderForm(props: { initialValues?: TripInput; error?: unknown } = {}) {
  const onSubmit = vi.fn()
  const utils = render(
    <MemoryRouter>
      <TripForm
        initialValues={props.initialValues ?? emptyTrip}
        submitLabel="Salvar"
        cancelTo="/trips"
        error={props.error}
        onSubmit={onSubmit}
      />
    </MemoryRouter>,
  )
  return { ...utils, onSubmit }
}

const save = () => userEvent.click(screen.getByRole('button', { name: 'Salvar' }))

describe('TripForm', () => {
  it('requires a name and focuses it', async () => {
    const { onSubmit } = renderForm()

    await save()

    expect(screen.getByText('Dê um nome à viagem.')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome da viagem')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Nome da viagem')).toHaveFocus()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it.each([
    [{ name: 'A' }, 'O nome deve ter pelo menos 2 caracteres.'],
    [{ name: 'a'.repeat(121) }, 'O nome deve ter no máximo 120 caracteres.'],
    [{ name: 'Ok', description: 'a'.repeat(2001) }, /no máximo 2000 caracteres/],
    [
      { name: 'Ok', startDate: '2027-07-15', endDate: '2027-07-01' },
      'A data final não pode ser antes da inicial.',
    ],
  ])('validates before sending: %#', async (values, message) => {
    const { onSubmit } = renderForm({ initialValues: { ...emptyTrip, ...values } })

    await save()

    expect(screen.getByText(message)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('sends the trimmed values, including the chosen date and status', async () => {
    const { onSubmit } = renderForm({ initialValues: { ...emptyTrip, startDate: '2027-01-05' } })

    await userEvent.type(screen.getByLabelText('Nome da viagem'), '  Floripa  ')
    await userEvent.click(screen.getByRole('combobox', { name: 'Data de início' }))
    await userEvent.click(screen.getByRole('button', { name: '10 de janeiro de 2027' }))
    await userEvent.click(screen.getByRole('combobox', { name: 'Status' }))
    await userEvent.click(screen.getByRole('option', { name: 'Confirmada' }))
    await save()

    expect(onSubmit).toHaveBeenCalledWith({
      ...emptyTrip,
      name: 'Floripa',
      startDate: '2027-01-10',
      status: 'CONFIRMED',
    })
  })

  it('shows each 422 error under its field until the field changes', async () => {
    const error = ApiError.fromResponse(422, {
      message: [
        'name must be longer than or equal to 2 characters',
        'endDate must not be earlier than startDate',
      ],
    })
    renderForm({ initialValues: { ...emptyTrip, name: 'Floripa' }, error })

    const name = screen.getByLabelText('Nome da viagem')
    expect(name).toHaveAccessibleDescription('Este campo deve ter pelo menos 2 caracteres.')
    expect(screen.getByLabelText('Data final')).toHaveAccessibleDescription(
      'Este campo não pode ser antes da data de início.',
    )

    await userEvent.type(name, '!')

    expect(screen.queryByText(/pelo menos 2 caracteres/)).not.toBeInTheDocument()
  })

  it('warns in general when the 422 field is not in the form', () => {
    const error = ApiError.fromResponse(422, { message: ['owner should not be empty'] })
    renderForm({ error })

    expect(screen.getByRole('alert')).toHaveTextContent('Confira os campos')
  })

  it('explains on the currency field why it cannot change (409)', () => {
    renderForm({ error: ApiError.fromResponse(409) })

    expect(screen.getByRole('combobox', { name: 'Moeda' })).toHaveAccessibleDescription(
      'A moeda não pode mudar porque a viagem já tem despesas.',
    )
  })

  it('shows other errors, like 403, as a general alert', () => {
    renderForm({ error: ApiError.fromResponse(403) })

    expect(screen.getByRole('alert')).toHaveTextContent('Você não tem permissão para fazer isso.')
  })

  it('keeps a saved currency that is not in the list', () => {
    expect(currencyOptions('CHF').at(-1)).toEqual({ value: 'CHF', label: 'CHF' })
    expect(currencyOptions('BRL').some((option) => option.value === 'CHF')).toBe(false)
  })
})
