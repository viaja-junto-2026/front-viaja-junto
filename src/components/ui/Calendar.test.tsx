import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Calendar } from './Calendar'
import { PhotoGrid } from './PhotoGrid'

describe('Calendar', () => {
  it('marks the chosen day and reports the clicked one', async () => {
    const onSelect = vi.fn()
    render(<Calendar value="2027-03-10" onSelect={onSelect} />)

    const chosen = screen.getByRole('button', { name: '10 de março de 2027' })
    expect(chosen.closest('td')).toHaveAttribute('aria-selected', 'true')
    expect(chosen).toHaveClass('bg-red-burgundy')

    await userEvent.click(screen.getByRole('button', { name: '20 de março de 2027' }))

    expect(onSelect).toHaveBeenCalledWith('2027-03-20')
  })

  it('keeps only one day in the tab order', () => {
    render(<Calendar value="2027-03-10" onSelect={() => {}} />)

    const inTabOrder = screen
      .getAllByRole('button')
      .filter((button) => button.getAttribute('data-day') && button.tabIndex === 0)
    expect(inTabOrder).toHaveLength(1)
  })
})

describe('PhotoGrid', () => {
  it('is a named list with two columns on phones and three on desktops', () => {
    render(
      <PhotoGrid label="Destinos">
        <li>Kyoto</li>
      </PhotoGrid>,
    )

    expect(screen.getByRole('list', { name: 'Destinos' })).toHaveClass(
      'grid-cols-2',
      'lg:grid-cols-3',
    )
  })
})
