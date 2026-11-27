import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Plane } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'
import { EmptyState } from '../feedback/EmptyState'
import { StatFilter } from './StatFilter'

const options = [
  { id: 'a', label: 'Todas', icon: Plane, count: 3 },
  { id: 'b', label: 'Confirmada', icon: Plane },
]

describe('StatFilter', () => {
  it('marks the selected option and shows a dash for an unknown count', () => {
    render(<StatFilter label="Status" options={options} value="a" onChange={() => {}} />)

    expect(screen.getByRole('group', { name: 'Status' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /3\s*Todas/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: /–\s*Confirmada/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('reports the chosen option', async () => {
    const onChange = vi.fn()
    render(<StatFilter label="Status" options={options} value="a" onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: /Confirmada/ }))

    expect(onChange).toHaveBeenCalledWith('b')
  })
})

describe('EmptyState with a plain icon', () => {
  it('draws the icon without the circle around it', () => {
    const { container } = render(<EmptyState icon={Plane} plainIcon title="Nada" />)

    expect(container.querySelector('svg')).toHaveClass('text-red-ruby')
    expect(container.querySelector('.rounded-full')).not.toBeInTheDocument()
  })
})
