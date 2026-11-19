import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Plane } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../services/apiError'
import { Button } from '../ui/Button'
import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'
import { LoadingSkeleton } from './LoadingSkeleton'
import { QueryState } from './QueryState'
import { Spinner } from './Spinner'

describe('Spinner', () => {
  it('announces the loading to screen readers', () => {
    render(<Spinner />)

    expect(screen.getByRole('status')).toHaveTextContent('Carregando')
  })

  it('accepts a custom label and size', () => {
    const { container } = render(<Spinner size="lg" label="Salvando viagem" />)

    expect(screen.getByRole('status')).toHaveTextContent('Salvando viagem')
    expect(container.querySelector('svg')).toHaveAttribute('width', '40')
  })
})

describe('LoadingSkeleton', () => {
  it('is a busy status region with 3 text lines by default', () => {
    const { container } = render(<LoadingSkeleton />)

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('Carregando')
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(3)
  })

  it.each([
    ['text', 2, 2],
    ['card', 4, 4],
    ['list', 3, 9],
  ] as const)('renders the %s variant', (variant, count, expectedBars) => {
    const { container } = render(<LoadingSkeleton variant={variant} count={count} />)

    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(expectedBars)
  })

  it('accepts a custom label', () => {
    render(<LoadingSkeleton label="Carregando viagens" />)

    expect(screen.getByRole('status')).toHaveTextContent('Carregando viagens')
  })
})

describe('ErrorState', () => {
  it('shows the default message in Portuguese as an alert', () => {
    render(<ErrorState />)

    expect(screen.getByRole('alert')).toHaveTextContent('Algo deu errado')
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar os dados')
  })

  it('shows a custom title and message', () => {
    render(<ErrorState title="Viagem não encontrada" message="Confira o endereço." />)

    expect(screen.getByRole('heading', { name: 'Viagem não encontrada' })).toBeInTheDocument()
    expect(screen.getByText('Confira o endereço.')).toBeInTheDocument()
  })

  it('hides the retry button without onRetry', () => {
    render(<ErrorState />)

    expect(screen.queryByRole('button', { name: 'Tentar de novo' })).not.toBeInTheDocument()
  })

  it('calls onRetry when the user clicks "Tentar de novo"', async () => {
    const onRetry = vi.fn()
    render(<ErrorState onRetry={onRetry} />)

    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))

    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('shows the loading state on the button while retrying', () => {
    render(<ErrorState onRetry={() => {}} retrying />)

    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeDisabled()
  })
})

describe('EmptyState', () => {
  it('shows the sentence and a default icon', () => {
    const { container } = render(<EmptyState title="Você ainda não tem viagens." />)

    expect(screen.getByRole('heading', { name: 'Você ainda não tem viagens.' })).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('shows a custom icon, a description and the action', async () => {
    const onClick = vi.fn()
    const { container } = render(
      <EmptyState
        icon={Plane}
        title="Sem viagens"
        description="Crie a primeira."
        action={<Button onClick={onClick}>Nova viagem</Button>}
      />,
    )

    expect(container.querySelector('.lucide-plane')).toBeInTheDocument()
    expect(screen.getByText('Crie a primeira.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Nova viagem' }))
    expect(onClick).toHaveBeenCalledOnce()
  })
})

describe('QueryState', () => {
  const base = { isLoading: false, isError: false }

  it('shows the content when there are data', () => {
    render(<QueryState {...base}>Conteúdo</QueryState>)

    expect(screen.getByText('Conteúdo')).toBeInTheDocument()
  })

  it('shows the skeleton while loading, before everything else', () => {
    render(
      <QueryState isLoading isError isEmpty>
        Conteúdo
      </QueryState>,
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByText('Conteúdo')).not.toBeInTheDocument()
  })

  it('accepts a custom loading element', () => {
    render(
      <QueryState isLoading isError={false} loading={<p>Buscando viagens...</p>}>
        Conteúdo
      </QueryState>,
    )

    expect(screen.getByText('Buscando viagens...')).toBeInTheDocument()
  })

  it('shows the error with a retry button wired to onRetry', async () => {
    const onRetry = vi.fn()
    render(
      <QueryState isLoading={false} isError onRetry={onRetry} errorMessage="Falhou, tente de novo.">
        Conteúdo
      </QueryState>,
    )

    expect(screen.getByText('Falhou, tente de novo.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('translates the error from the hook into a Portuguese message', () => {
    const { rerender } = render(
      <QueryState isLoading={false} isError error={ApiError.fromResponse(404)}>
        Conteúdo
      </QueryState>,
    )
    expect(screen.getByText('Não encontramos o que você procurou.')).toBeInTheDocument()

    rerender(
      <QueryState isLoading={false} isError error={new TypeError('Failed to fetch')}>
        Conteúdo
      </QueryState>,
    )
    expect(screen.getByText(/Sem conexão com o servidor/)).toBeInTheDocument()

    rerender(
      <QueryState
        isLoading={false}
        isError
        error={ApiError.fromResponse(404)}
        errorMessage="Mensagem da tela"
      >
        Conteúdo
      </QueryState>,
    )
    expect(screen.getByText('Mensagem da tela')).toBeInTheDocument()
  })

  it('shows the empty state, default or custom', () => {
    const { rerender } = render(
      <QueryState {...base} isEmpty>
        Conteúdo
      </QueryState>,
    )
    expect(screen.getByRole('heading', { name: 'Nada por aqui ainda' })).toBeInTheDocument()

    rerender(
      <QueryState {...base} isEmpty empty={<EmptyState title="Sem viagens" />}>
        Conteúdo
      </QueryState>,
    )
    expect(screen.getByRole('heading', { name: 'Sem viagens' })).toBeInTheDocument()
    expect(screen.queryByText('Conteúdo')).not.toBeInTheDocument()
  })
})
