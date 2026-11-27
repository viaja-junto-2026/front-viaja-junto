import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AuthShell } from '../layout/AuthShell'
import { RatingStars } from '../reviews/RatingStars'
import { BackLink } from './BackLink'
import { FlushCard } from './Card'
import { DetailHero } from './DetailHero'
import { ExternalTextLink } from './ExternalTextLink'
import { PageBanner } from './PageBanner'
import { TextLink } from './TextLink'

describe('PageBanner', () => {
  it('is a white header with the page heading and extra information', () => {
    render(
      <PageBanner eyebrow="Descobrir" title="Destinos" description="Lugares para ir.">
        64 destinos
      </PageBanner>,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Destinos' })).toBeInTheDocument()
    expect(screen.getByText('Lugares para ir.')).toBeInTheDocument()
    expect(screen.getByText('64 destinos')).toBeInTheDocument()
    expect(screen.getByRole('banner')).toHaveClass('bg-white')
  })

  it('works without extra information', () => {
    render(<PageBanner eyebrow="A" title="B" description="C" />)

    expect(screen.getByRole('heading', { name: 'B' })).toBeInTheDocument()
  })
})

describe('DetailHero', () => {
  it('shows the back link, the photo area and the text on a white block', () => {
    render(
      <MemoryRouter>
        <DetailHero back={{ to: '/destinations', label: 'Voltar' }} media={<p>foto</p>}>
          <h1>Paris</h1>
        </DetailHero>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Voltar' })).toHaveAttribute('href', '/destinations')
    expect(screen.getByRole('link', { name: 'Voltar' })).toHaveClass('text-red-burgundy')
    expect(screen.getByText('foto')).toBeInTheDocument()
    expect(screen.getByRole('article')).toHaveClass('bg-white')
  })
})

describe('text links and stars', () => {
  it('uses burgundy on the text links', () => {
    render(
      <MemoryRouter>
        <BackLink to="/a">voltar</BackLink>
        <TextLink to="/b">ver</TextLink>
        <ExternalTextLink href="https://x.test">fora</ExternalTextLink>
      </MemoryRouter>,
    )

    for (const name of ['voltar', 'ver', 'fora']) {
      expect(screen.getByRole('link', { name })).toHaveClass('text-red-burgundy')
    }
  })

  it('paints the filled stars in ruby', () => {
    const { container } = render(<RatingStars rating={4} showValue />)

    expect(screen.getByRole('img', { name: 'Nota 4,0 de 5' })).toHaveTextContent('4,0')
    expect(container.querySelectorAll('.text-red-ruby')).toHaveLength(4)
    expect(screen.getByText('4,0')).toHaveClass('text-gray-ink')
  })
})

describe('FlushCard', () => {
  it('has square corners and no inner padding', () => {
    render(<FlushCard data-testid="flush">x</FlushCard>)

    expect(screen.getByTestId('flush')).toHaveClass('rounded-xs')
    expect(screen.getByTestId('flush')).not.toHaveClass('p-6')
  })
})

describe('AuthShell', () => {
  it('wraps the content in the main area beside the brown panel', () => {
    render(<AuthShell>conteúdo</AuthShell>)

    expect(screen.getByRole('main')).toHaveTextContent('conteúdo')
    expect(screen.getByRole('main')).toHaveTextContent('Sua viagem começa aqui.')
  })
})
