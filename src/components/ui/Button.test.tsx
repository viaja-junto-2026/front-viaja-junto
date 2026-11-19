import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders a primary button of type "button" by default', () => {
    render(<Button>Nova viagem</Button>)

    const button = screen.getByRole('button', { name: 'Nova viagem' })
    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveClass('bg-red-ruby')
  })

  it.each([
    ['secondary', 'bg-rose-dusty'],
    ['compact', 'h-9'],
    ['danger', 'bg-rose-dusty'],
    ['pill', 'rounded-full'],
  ] as const)('applies the %s variant', (variant, expectedClass) => {
    render(<Button variant={variant}>Ação</Button>)

    expect(screen.getByRole('button', { name: 'Ação' })).toHaveClass(expectedClass)
  })

  it('shows a trash icon by default on the danger variant', () => {
    const { container } = render(<Button variant="danger">Excluir</Button>)

    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('shows a custom left icon', () => {
    render(<Button leftIcon={<span data-testid="icon" />}>Com ícone</Button>)

    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Salvar</Button>)

    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('blocks clicks and is marked as busy while loading', async () => {
    const onClick = vi.fn()
    render(
      <Button loading onClick={onClick}>
        Salvando
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Salvando' })

    await userEvent.click(button)

    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(onClick).not.toHaveBeenCalled()
  })

  it('does not call onClick when disabled', async () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Salvar
      </Button>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(onClick).not.toHaveBeenCalled()
  })

  it('looks different when disabled, but keeps its color while loading', () => {
    const { rerender } = render(<Button disabled>Salvar</Button>)
    expect(screen.getByRole('button', { name: 'Salvar' })).toHaveClass('bg-beige-sand')
    expect(screen.getByRole('button', { name: 'Salvar' })).not.toHaveClass('bg-red-ruby')

    rerender(
      <Button disabled loading>
        Salvar
      </Button>,
    )
    expect(screen.getByRole('button', { name: 'Salvar' })).toHaveClass('bg-red-ruby')
  })

  it('can take the full width', () => {
    render(<Button fullWidth>Largo</Button>)

    expect(screen.getByRole('button', { name: 'Largo' })).toHaveClass('w-full')
  })
})
