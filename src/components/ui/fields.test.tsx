import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Input } from './Input'
import { Textarea } from './Textarea'

describe('Input', () => {
  it('links the label to the field', async () => {
    render(<Input label="Nome da viagem" />)

    await userEvent.type(screen.getByLabelText('Nome da viagem'), 'Floripa')

    expect(screen.getByLabelText('Nome da viagem')).toHaveValue('Floripa')
  })

  it('describes the field with the helper text', () => {
    render(<Input label="Nome" helperText="Use um nome curto." />)

    const input = screen.getByLabelText('Nome')
    expect(input).toHaveAccessibleDescription('Use um nome curto.')
    expect(input).not.toHaveAttribute('aria-invalid')
  })

  it('shows the error instead of the helper text and marks the field as invalid', () => {
    render(<Input label="Nome" helperText="Ajuda" error="Informe o nome." />)

    const input = screen.getByLabelText('Nome')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('Informe o nome.')
    expect(screen.queryByText('Ajuda')).not.toBeInTheDocument()
    expect(input).toHaveClass('border-red-burgundy')
  })

  it('uses the id received', () => {
    render(<Input label="Nome" id="trip-name" />)

    expect(screen.getByLabelText('Nome')).toHaveAttribute('id', 'trip-name')
  })

  it('can be disabled', () => {
    render(<Input label="Nome" disabled />)

    expect(screen.getByLabelText('Nome')).toBeDisabled()
  })
})

describe('Textarea', () => {
  it('links the label, accepts text and shows the error', async () => {
    render(<Textarea label="Descrição" error="Muito longa." />)
    const textarea = screen.getByLabelText('Descrição')

    await userEvent.type(textarea, 'Oi')

    expect(textarea).toHaveValue('Oi')
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
    expect(textarea).toHaveAccessibleDescription('Muito longa.')
  })

  it('uses 4 rows by default and accepts a helper text', () => {
    render(<Textarea label="Descrição" helperText="Opcional." />)

    const textarea = screen.getByLabelText('Descrição')
    expect(textarea).toHaveAttribute('rows', '4')
    expect(textarea).toHaveAccessibleDescription('Opcional.')
  })
})
