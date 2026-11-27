import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SwipeList } from './SwipeList'

function renderList(count = 3) {
  render(
    <SwipeList label="Viagens">
      {Array.from({ length: count }, (_, index) => (
        <p key={index}>Viagem {index + 1}</p>
      ))}
    </SwipeList>,
  )
  return screen.getByRole('list', { name: 'Viagens' })
}

/** O jsdom não calcula tamanhos: os valores da rolagem são definidos na mão. */
function scrollTo(list: HTMLElement, scrollLeft: number, offsets = [0, 300, 600]) {
  const sizes = { scrollWidth: 900, clientWidth: 360, scrollLeft }
  for (const [key, value] of Object.entries(sizes)) {
    Object.defineProperty(list, key, { configurable: true, value })
  }
  Array.from(list.children).forEach((item, index) => {
    Object.defineProperty(item, 'offsetLeft', { configurable: true, value: offsets[index] })
  })
  fireEvent.scroll(list)
}

describe('SwipeList', () => {
  it('swipes on phones and becomes a grid from tablets up', () => {
    const list = renderList()

    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    expect(list).toHaveClass('overflow-x-auto', 'snap-x', 'sm:grid', 'lg:grid-cols-3')
  })

  it('tells which item is visible while swiping', () => {
    const list = renderList()
    expect(screen.getByText('Item 1 de 3')).toBeInTheDocument()

    scrollTo(list, 300)
    expect(screen.getByText('Item 2 de 3')).toBeInTheDocument()

    scrollTo(list, 540)
    expect(screen.getByText('Item 3 de 3')).toBeInTheDocument()

    scrollTo(list, 0)
    expect(screen.getByText('Item 1 de 3')).toBeInTheDocument()
  })

  it('stays on the first item when everything fits', () => {
    const list = renderList()

    fireEvent.scroll(list)

    expect(screen.getByText('Item 1 de 3')).toBeInTheDocument()
  })

  it('has no position marker with a single item', () => {
    renderList(1)

    expect(screen.queryByText(/Item 1 de/)).not.toBeInTheDocument()
  })
})
