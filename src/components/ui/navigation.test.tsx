import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Star } from 'lucide-react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'
import { ButtonLink } from './ButtonLink'
import { Card, FloatingCard } from './Card'
import { Carousel } from './Carousel'
import { IconButton, IconButtonLink } from './IconButton'
import { IconCircle } from './IconCircle'
import { SectionHeader } from './SectionHeader'
import { TextLink } from './TextLink'

function renderInRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('ButtonLink', () => {
  it('is a link with the look of a button', () => {
    renderInRouter(<ButtonLink to="/trips/new">Nova viagem</ButtonLink>)

    const link = screen.getByRole('link', { name: 'Nova viagem' })
    expect(link).toHaveAttribute('href', '/trips/new')
    expect(link).toHaveClass('bg-red-ruby', 'h-12')
  })

  it.each([
    ['secondary', 'bg-rose-dusty'],
    ['compact', 'h-9'],
    ['danger', 'text-brown-espresso'],
    ['solid', 'uppercase'],
  ] as const)('applies the %s variant', (variant, expectedClass) => {
    renderInRouter(
      <ButtonLink to="/x" variant={variant}>
        Ir
      </ButtonLink>,
    )

    expect(screen.getByRole('link', { name: 'Ir' })).toHaveClass(expectedClass)
  })

  it('shows the icons on both sides', () => {
    renderInRouter(
      <ButtonLink
        to="/x"
        leftIcon={<span data-testid="left" />}
        rightIcon={<span data-testid="right" />}
      >
        Ir
      </ButtonLink>,
    )

    expect(screen.getByTestId('left')).toBeInTheDocument()
    expect(screen.getByTestId('right')).toBeInTheDocument()
  })

  it.each(['primary', 'secondary', 'compact', 'danger'] as const)(
    'has square corners on the %s variant',
    (variant) => {
      render(<Button variant={variant}>Ação</Button>)

      expect(screen.getByRole('button', { name: 'Ação' })).toHaveClass('rounded-xs')
    },
  )

  it('can take the full width', () => {
    renderInRouter(
      <ButtonLink to="/x" fullWidth className="mt-4">
        Largo
      </ButtonLink>,
    )

    expect(screen.getByRole('link', { name: 'Largo' })).toHaveClass('w-full', 'mt-4')
  })
})

describe('Button trailing icon', () => {
  it('shows a custom right icon', () => {
    render(<Button rightIcon={<span data-testid="right" />}>Próximo</Button>)

    expect(screen.getByTestId('right')).toBeInTheDocument()
  })
})

describe('IconButton', () => {
  it('is a button named by its label, square and white by default', async () => {
    const onClick = vi.fn()
    render(
      <IconButton label="Fechar" onClick={onClick}>
        x
      </IconButton>,
    )
    const button = screen.getByRole('button', { name: 'Fechar' })

    await userEvent.click(button)

    expect(onClick).toHaveBeenCalledOnce()
    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveClass('rounded-xs', 'bg-white', 'size-12')
  })

  it('has a round brand version as a link', () => {
    renderInRouter(
      <IconButtonLink to="/notifications" label="Avisos" variant="brand" size="sm" shape="round">
        x
      </IconButtonLink>,
    )

    const link = screen.getByRole('link', { name: 'Avisos' })
    expect(link).toHaveAttribute('href', '/notifications')
    expect(link).toHaveClass('rounded-full', 'bg-red-ruby', 'size-8')
  })
})

describe('TextLink', () => {
  it('is a link with an arrow', () => {
    const { container } = renderInRouter(<TextLink to="/destinations">Ver todas</TextLink>)

    expect(screen.getByRole('link', { name: 'Ver todas' })).toHaveAttribute('href', '/destinations')
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})

describe('IconCircle', () => {
  it('shows the icon in a circle, with a default tone and size', () => {
    const { container } = render(<IconCircle icon={Star} />)

    expect(container.querySelector('.lucide-star')).toHaveAttribute('width', '24')
    expect(container.firstChild).toHaveClass('bg-beige-sand', 'size-12')
  })

  it.each([
    ['wheat', 'bg-yellow-wheat'],
    ['mist', 'bg-blue-mist'],
    ['blush', 'bg-rose-blush'],
  ] as const)('has the %s tone', (tone, expectedClass) => {
    const { container } = render(<IconCircle icon={Star} tone={tone} />)

    expect(container.firstChild).toHaveClass(expectedClass)
  })

  it('has a large size', () => {
    const { container } = render(<IconCircle icon={Star} size="lg" />)

    expect(container.firstChild).toHaveClass('size-14')
    expect(container.querySelector('.lucide-star')).toHaveAttribute('width', '28')
  })
})

describe('SectionHeader', () => {
  it('shows the title and the actions', () => {
    render(
      <SectionHeader title="Destinos">
        <button type="button">Ver todas</button>
      </SectionHeader>,
    )

    expect(screen.getByRole('heading', { name: 'Destinos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver todas' })).toBeInTheDocument()
  })

  it('works without actions', () => {
    render(<SectionHeader title="Só título" />)

    expect(screen.getByRole('heading', { name: 'Só título' })).toBeInTheDocument()
  })
})

describe('FloatingCard', () => {
  it('has the floating look and the content of a card', () => {
    render(
      <>
        <FloatingCard data-testid="floating">Resumo</FloatingCard>
        <Card data-testid="card">Normal</Card>
      </>,
    )

    expect(screen.getByTestId('floating')).toHaveClass('rounded-lg', 'p-4', 'shadow-xl')
    expect(screen.getByTestId('card')).not.toHaveClass('shadow-xl')
  })
})

describe('Carousel', () => {
  function renderCarousel() {
    return renderInRouter(
      <Carousel title="Destinos" action={<a href="/destinations">Ver todas</a>}>
        <p>Kyoto</p>
        <p>Lisboa</p>
        <p>Paris</p>
      </Carousel>,
    )
  }

  it('is a named region with a title, an action and one item per child', () => {
    renderCarousel()

    expect(screen.getByRole('region', { name: 'Destinos' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Destinos' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver todas' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('scrolls the track with the arrows', async () => {
    renderCarousel()
    const track = screen.getByRole('list')
    const scrollBy = vi.fn()
    track.scrollBy = scrollBy
    Object.defineProperty(track, 'clientWidth', { value: 500, configurable: true })

    await userEvent.click(screen.getByRole('button', { name: 'Próximos' }))
    await userEvent.click(screen.getByRole('button', { name: 'Anteriores' }))

    expect(scrollBy).toHaveBeenNthCalledWith(1, { left: 400, behavior: 'smooth' })
    expect(scrollBy).toHaveBeenNthCalledWith(2, { left: -400, behavior: 'smooth' })
  })

  it('does not break where the browser has no scrollBy', async () => {
    renderCarousel()

    await userEvent.click(screen.getByRole('button', { name: 'Próximos' }))

    expect(screen.getByRole('list')).toBeInTheDocument()
  })
})
