import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Select, type SelectProps } from './Select'

const options = [
  { value: 'PLANNING', label: 'Planejando' },
  { value: 'CONFIRMED', label: 'Confirmada' },
  { value: 'COMPLETED', label: 'Concluída', disabled: true },
  { value: 'OTHER', label: 'Outra' },
]

function renderSelect(props: Partial<SelectProps> = {}) {
  return render(<Select label="Status" options={options} {...props} />)
}

describe('Select', () => {
  it('shows the placeholder until something is chosen', () => {
    renderSelect()

    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveTextContent('Selecione')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('shows a custom placeholder and the default value', () => {
    const { unmount } = renderSelect({ placeholder: 'Escolha' })
    expect(screen.getByRole('combobox')).toHaveTextContent('Escolha')
    unmount()

    renderSelect({ defaultValue: 'CONFIRMED' })
    expect(screen.getByRole('combobox')).toHaveTextContent('Confirmada')
  })

  it('opens the list, chooses an option with the mouse and closes', async () => {
    const onChange = vi.fn()
    renderSelect({ onChange })

    await userEvent.click(screen.getByRole('combobox'))
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getAllByRole('option')).toHaveLength(4)

    await userEvent.click(screen.getByRole('option', { name: 'Confirmada' }))

    expect(onChange).toHaveBeenCalledWith('CONFIRMED')
    expect(screen.getByRole('combobox')).toHaveTextContent('Confirmada')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveFocus()
  })

  it('marks the chosen option and highlights it when reopening', async () => {
    renderSelect({ defaultValue: 'OTHER' })

    await userEvent.click(screen.getByRole('combobox'))

    const option = screen.getByRole('option', { name: 'Outra' })
    expect(option).toHaveAttribute('aria-selected', 'true')
    expect(option).toHaveClass('bg-rose-vintage')
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-activedescendant', option.id)
  })

  it('does not let the user choose a disabled option', async () => {
    const onChange = vi.fn()
    renderSelect({ onChange })
    await userEvent.click(screen.getByRole('combobox'))

    await userEvent.click(screen.getByRole('option', { name: 'Concluída' }))

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('works controlled: the parent decides the value', async () => {
    const onChange = vi.fn()
    renderSelect({ value: 'PLANNING', onChange })

    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(screen.getByRole('option', { name: 'Outra' }))

    expect(onChange).toHaveBeenCalledWith('OTHER')
    expect(screen.getByRole('combobox')).toHaveTextContent('Planejando')
  })

  it('opens with the keyboard and skips disabled options', async () => {
    const onChange = vi.fn()
    renderSelect({ onChange })
    await userEvent.tab()

    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Planejando' })).toHaveClass('bg-rose-vintage')

    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('option', { name: 'Confirmada' })).toHaveClass('bg-rose-vintage')

    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('option', { name: 'Outra' })).toHaveClass('bg-rose-vintage')

    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('option', { name: 'Outra' })).toHaveClass('bg-rose-vintage')

    await userEvent.keyboard('{ArrowUp}{ArrowUp}')
    expect(screen.getByRole('option', { name: 'Planejando' })).toHaveClass('bg-rose-vintage')

    await userEvent.keyboard('{End}')
    expect(screen.getByRole('option', { name: 'Outra' })).toHaveClass('bg-rose-vintage')

    await userEvent.keyboard('{Home}')
    await userEvent.keyboard('{Enter}')

    expect(onChange).toHaveBeenCalledWith('PLANNING')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('opens with Enter and Space and chooses with Space', async () => {
    const onChange = vi.fn()
    renderSelect({ onChange })
    await userEvent.tab()

    await userEvent.keyboard('{Enter}')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')

    await userEvent.keyboard(' ')
    await userEvent.keyboard('{ArrowDown} ')

    expect(onChange).toHaveBeenCalledWith('CONFIRMED')
  })

  it('closes with Esc (without closing a surrounding handler) and with Tab', async () => {
    const onOuterKeyDown = vi.fn()
    render(
      <div onKeyDown={onOuterKeyDown}>
        <Select label="Status" options={options} />
      </div>,
    )
    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}')

    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(onOuterKeyDown).toHaveBeenCalledTimes(1) // só o ArrowDown que abriu

    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{Tab}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('ignores other keys while closed and open', async () => {
    renderSelect()
    await userEvent.tab()

    await userEvent.keyboard('a')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('a')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('toggles by clicking the field and closes when clicking outside', async () => {
    renderSelect()
    const field = screen.getByRole('combobox')

    await userEvent.click(field)
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    await userEvent.click(field)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

    await userEvent.click(field)
    await userEvent.click(document.body)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('highlights the option under the mouse, except disabled ones', async () => {
    renderSelect()
    await userEvent.click(screen.getByRole('combobox'))

    await userEvent.hover(screen.getByRole('option', { name: 'Outra' }))
    expect(screen.getByRole('option', { name: 'Outra' })).toHaveClass('bg-rose-vintage')

    await userEvent.hover(screen.getByRole('option', { name: 'Concluída' }))
    expect(screen.getByRole('option', { name: 'Concluída' })).not.toHaveClass('bg-rose-vintage')
  })

  it('sends the value in a form through a hidden field', async () => {
    const { container } = renderSelect({ name: 'status', defaultValue: 'CONFIRMED' })

    expect(container.querySelector('input[name="status"]')).toHaveValue('CONFIRMED')
  })

  it('shows helper text and error, and can be disabled', () => {
    const { rerender } = renderSelect({ helperText: 'Pode mudar depois.' })
    expect(screen.getByRole('combobox')).toHaveAccessibleDescription('Pode mudar depois.')

    rerender(<Select label="Status" options={options} error="Escolha um status." disabled />)
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('combobox')).toHaveAccessibleDescription('Escolha um status.')
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('does nothing when there are no enabled options', async () => {
    renderSelect({ options: [{ value: 'A', label: 'Única', disabled: true }] })
    await userEvent.tab()

    await userEvent.keyboard('{ArrowDown}{Enter}')

    expect(screen.getByRole('combobox')).toHaveTextContent('Selecione')
  })
})
