import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Alert } from './Alert'
import { Avatar, AvatarGroup } from './Avatar'
import { Badge } from './Badge'
import { Card, CardCompact, CardTitle } from './Card'
import { Chip } from './Chip'
import { ProgressBar } from './ProgressBar'

describe('Card', () => {
  it('renders the default and the compact sizes', () => {
    render(
      <>
        <Card data-testid="card">
          <CardTitle>Floripa</CardTitle>
        </Card>
        <CardCompact data-testid="compact">Item</CardCompact>
      </>,
    )

    expect(screen.getByTestId('card')).toHaveClass('rounded-xs', 'p-6')
    expect(screen.getByTestId('compact')).toHaveClass('rounded-xs', 'p-4')
    expect(screen.getByRole('heading', { name: 'Floripa' })).toBeInTheDocument()
  })

  it('adds the hover shadow when interactive and can use another element', () => {
    render(
      <ul>
        <Card as="li" interactive data-testid="card">
          Viagem
        </Card>
      </ul>,
    )

    expect(screen.getByTestId('card').tagName).toBe('LI')
    expect(screen.getByTestId('card')).toHaveClass('hover:shadow-md')
  })
})

describe('Badge', () => {
  it.each([
    ['PLANNING', 'Planejando', 'bg-blue-mist'],
    ['CONFIRMED', 'Confirmada', 'bg-green-mint'],
    ['COMPLETED', 'Concluída', 'bg-beige-sand'],
  ] as const)('shows the text and the color of %s', (status, label, color) => {
    render(<Badge status={status} />)

    expect(screen.getByText(label)).toHaveClass(color, 'uppercase')
  })
})

describe('Chip', () => {
  it('is a toggle button: not selected by default', () => {
    render(<Chip>Passeio</Chip>)

    const chip = screen.getByRole('button', { name: 'Passeio' })
    expect(chip).toHaveAttribute('aria-pressed', 'false')
    expect(chip).toHaveClass('bg-beige-sand')
  })

  it('shows the selected state with a check icon', () => {
    const { container } = render(<Chip selected>Passeio</Chip>)

    const chip = screen.getByRole('button', { name: 'Passeio' })
    expect(chip).toHaveAttribute('aria-pressed', 'true')
    expect(chip).toHaveClass('bg-rose-vintage')
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('calls onClick', async () => {
    const onClick = vi.fn()
    render(<Chip onClick={onClick}>Comida</Chip>)

    await userEvent.click(screen.getByRole('button', { name: 'Comida' }))

    expect(onClick).toHaveBeenCalledOnce()
  })
})

describe('Avatar', () => {
  it('shows the initials and exposes the full name', () => {
    render(<Avatar name="Gustavo Fidelis" />)

    expect(screen.getByRole('img', { name: 'Gustavo Fidelis' })).toHaveTextContent('GF')
    expect(screen.getByRole('img')).toHaveClass('size-10')
  })

  it('has a small size', () => {
    render(<Avatar name="Maria" size="sm" />)

    expect(screen.getByRole('img', { name: 'Maria' })).toHaveClass('size-8')
  })
})

describe('AvatarGroup', () => {
  it('shows every avatar when they fit', () => {
    render(<AvatarGroup names={['Ana Lima', 'Bia Souza']} />)

    expect(screen.getByRole('list', { name: '2 pessoas' })).toBeInTheDocument()
    expect(screen.getAllByRole('img')).toHaveLength(2)
  })

  it('collapses the extra people into a "+N"', () => {
    render(<AvatarGroup names={['A A', 'B B', 'C C', 'D D', 'E E', 'F F']} max={3} />)

    expect(screen.getAllByRole('img')).toHaveLength(4)
    expect(screen.getByRole('img', { name: 'mais 3 pessoas' })).toHaveTextContent('+3')
  })
})

describe('Alert', () => {
  it.each([
    ['success', 'bg-green-mint', 'status'],
    ['warning', 'bg-yellow-wheat', 'status'],
    ['error', 'bg-rose-blush', 'alert'],
    ['info', 'bg-blue-mist', 'status'],
  ] as const)('renders the %s variant with an icon and the right role', (variant, color, role) => {
    const { container } = render(<Alert variant={variant}>Mensagem</Alert>)

    expect(screen.getByRole(role)).toHaveClass(color)
    expect(screen.getByRole(role)).toHaveTextContent('Mensagem')
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('shows an optional title', () => {
    render(
      <Alert variant="warning" title="Orçamento estourado">
        Passou do limite.
      </Alert>,
    )

    expect(screen.getByText('Orçamento estourado')).toBeInTheDocument()
  })
})

describe('ProgressBar', () => {
  it('exposes the progress and fills the bar proportionally', () => {
    const { container } = render(<ProgressBar value={30} label="Orçamento" />)

    const bar = screen.getByRole('progressbar', { name: 'Orçamento' })
    expect(bar).toHaveAttribute('aria-valuenow', '30')
    expect(bar).toHaveAttribute('aria-valuemax', '100')
    expect(container.querySelector('[style]')).toHaveStyle({ width: '30%' })
  })

  it('uses a custom maximum', () => {
    const { container } = render(<ProgressBar value={500} max={2000} label="Gasto" />)

    expect(container.querySelector('[style]')).toHaveStyle({ width: '25%' })
  })

  it('keeps the bar full above the maximum and empty below zero', () => {
    const { container, rerender } = render(<ProgressBar value={150} label="Orçamento" />)
    expect(container.querySelector('[style]')).toHaveStyle({ width: '100%' })
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')

    rerender(<ProgressBar value={-5} label="Orçamento" />)
    expect(container.querySelector('[style]')).toHaveStyle({ width: '0%' })
  })

  it('does not break when the maximum is zero', () => {
    const { container } = render(<ProgressBar value={10} max={0} label="Vazio" />)

    expect(container.querySelector('[style]')).toHaveStyle({ width: '0%' })
  })
})
