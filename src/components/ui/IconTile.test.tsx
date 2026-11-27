import { render } from '@testing-library/react'
import { Bus } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import { IconTile } from './IconTile'

describe('IconTile', () => {
  it('shows a decorative white icon on a rounded ruby square', () => {
    const { container } = render(<IconTile icon={Bus} />)

    expect(container.firstChild).toHaveClass('rounded-xs', 'bg-red-ruby', 'text-white')
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })
})
