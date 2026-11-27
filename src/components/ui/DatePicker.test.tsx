import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { addDays, addMonths, monthWeeks, todayIso } from '../../utils/calendar'
import { DatePicker } from './DatePicker'

type HarnessProps = {
  initial?: string | null
  min?: string
  error?: string
  onChange?: (value: string | null) => void
}

function Harness({ initial = '2027-03-10', min, error, onChange }: HarnessProps) {
  const [value, setValue] = useState<string | null>(initial)
  return (
    <>
      <DatePicker
        label="Data de início"
        value={value}
        min={min}
        error={error}
        onChange={(next) => {
          setValue(next)
          onChange?.(next)
        }}
      />
      <p>fora</p>
    </>
  )
}

const field = () => screen.getByRole('combobox', { name: 'Data de início' })
const open = () => userEvent.click(field())

describe('calendar utils', () => {
  it('walks through months and years without skipping days', () => {
    expect(addDays('2027-12-31', 1)).toBe('2028-01-01')
    expect(addMonths('2027-01-31', 1)).toBe('2027-02-28')
    expect(addMonths('2028-03-31', -1)).toBe('2028-02-29')
  })

  it('always builds six weeks, starting on Sunday', () => {
    const weeks = monthWeeks('2027-03-10')

    expect(weeks).toHaveLength(6)
    expect(weeks[0]).toEqual([
      null,
      '2027-03-01',
      '2027-03-02',
      '2027-03-03',
      '2027-03-04',
      '2027-03-05',
      '2027-03-06',
    ])
    expect(weeks.flat().filter(Boolean)).toHaveLength(31)
  })

  it('uses the local day for today', () => {
    expect(todayIso(new Date(2027, 2, 10, 23, 59))).toBe('2027-03-10')
  })
})

describe('DatePicker', () => {
  it('shows the date like the rest of the app, or the placeholder', () => {
    const { unmount } = render(<Harness />)
    expect(field()).toHaveTextContent('10 mar. 2027')
    unmount()

    render(<Harness initial={null} />)
    expect(field()).toHaveTextContent('Escolha a data')
  })

  it('opens on the chosen month, picks a day and closes', async () => {
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)

    await open()
    expect(screen.getByRole('grid', { name: 'Março de 2027' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '10 de março de 2027' })).toHaveFocus()

    await userEvent.click(screen.getByRole('button', { name: '15 de março de 2027' }))

    expect(onChange).toHaveBeenCalledWith('2027-03-15')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(field()).toHaveFocus()
  })

  it('changes the month with the arrow buttons', async () => {
    render(<Harness />)
    await open()

    await userEvent.click(screen.getByRole('button', { name: 'Próximo mês' }))
    expect(screen.getByRole('grid', { name: 'Abril de 2027' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Mês anterior' }))
    await userEvent.click(screen.getByRole('button', { name: 'Mês anterior' }))
    expect(screen.getByRole('grid', { name: 'Fevereiro de 2027' })).toBeInTheDocument()
  })

  it.each([
    ['{ArrowRight}', '11 de março de 2027'],
    ['{ArrowLeft}', '9 de março de 2027'],
    ['{ArrowDown}', '17 de março de 2027'],
    ['{ArrowUp}', '3 de março de 2027'],
    ['{Home}', '7 de março de 2027'],
    ['{End}', '13 de março de 2027'],
    ['{PageDown}', '10 de abril de 2027'],
    ['{PageUp}', '10 de fevereiro de 2027'],
    ['{Shift>}{PageDown}{/Shift}', '10 de março de 2028'],
  ])('moves the focus with %s', async (keys, day) => {
    render(<Harness />)
    await open()

    await userEvent.keyboard(keys)

    expect(screen.getByRole('button', { name: day })).toHaveFocus()
  })

  it('blocks the days before the minimum', async () => {
    render(<Harness min="2027-03-08" />)
    await open()

    expect(screen.getByRole('button', { name: '7 de março de 2027' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '8 de março de 2027' })).toBeEnabled()
  })

  it('starts on the minimum month when it is in the future and today is blocked', async () => {
    render(<Harness initial={null} min="2999-05-02" />)
    await open()

    expect(screen.getByRole('grid', { name: 'Maio de 2999' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hoje' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Limpar' })).toBeDisabled()
  })

  it('clears the date and picks today with the shortcuts', async () => {
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)

    await open()
    await userEvent.click(screen.getByRole('button', { name: 'Limpar' }))
    expect(onChange).toHaveBeenLastCalledWith(null)

    await open()
    await userEvent.click(screen.getByRole('button', { name: 'Hoje' }))
    expect(onChange).toHaveBeenLastCalledWith(todayIso())
  })

  it('closes with Escape, with a click outside and when the field is clicked again', async () => {
    render(<Harness />)

    await open()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(field()).toHaveFocus()

    await open()
    await userEvent.click(screen.getByText('fora'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await open()
    await open()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('marks the field with its error', () => {
    render(<Harness error="Escolha outra data." />)

    expect(field()).toHaveAttribute('aria-invalid', 'true')
    expect(field()).toHaveAccessibleDescription('Escolha outra data.')
  })
})
