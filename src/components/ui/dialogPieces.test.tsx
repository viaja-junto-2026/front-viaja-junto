import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Calendar } from './Calendar'
import { FormActions } from './FormActions'
import { Modal } from './Modal'
import { OptionList } from './OptionList'
import { Select } from './Select'
import { WarningList } from './WarningList'

describe('OptionList', () => {
  it('reports the chosen option', async () => {
    const onSelect = vi.fn()
    render(
      <OptionList
        label="Resultados"
        options={[{ id: 'a', title: 'Kyoto', subtitle: 'Japão' }]}
        onSelect={onSelect}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: /Kyoto/ }))

    expect(onSelect).toHaveBeenCalledWith('a')
  })
})

describe('FormActions', () => {
  it('has cancel and submit, and the destructive action only when given', async () => {
    const remove = vi.fn()
    const { rerender } = render(<FormActions submitLabel="Salvar" onCancel={() => {}} />)
    expect(screen.queryByRole('button', { name: 'Excluir' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Salvar' })).toHaveAttribute('type', 'submit')

    rerender(
      <FormActions
        submitLabel="Salvar"
        onCancel={() => {}}
        remove={{ label: 'Excluir', onClick: remove }}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }))
    expect(remove).toHaveBeenCalledOnce()
  })
})

describe('Modal scroll lock', () => {
  function Two({ first, second }: { first: boolean; second: boolean }) {
    return (
      <>
        <Modal open={first} title="Um" onClose={() => {}}>
          um
        </Modal>
        <Modal open={second} title="Dois" onClose={() => {}}>
          dois
        </Modal>
      </>
    )
  }

  it('stays locked while any window is open and is released when all close together', () => {
    const { rerender } = render(<Two first second />)
    expect(document.body.style.overflow).toBe('hidden')

    rerender(<Two first second={false} />)
    expect(document.body.style.overflow).toBe('hidden')

    rerender(<Two first second />)
    rerender(<Two first={false} second={false} />)
    expect(document.body.style.overflow).toBe('')
  })
})

describe('Calendar with a last day', () => {
  it('blocks the days after it and starts on it when today is later', () => {
    render(<Calendar value={null} max="2020-03-10" onSelect={() => {}} />)

    expect(screen.getByRole('grid', { name: 'Março de 2020' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '11 de março de 2020' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '10 de março de 2020' })).toBeEnabled()
  })
})

describe('WarningList', () => {
  it('lists each warning and renders nothing without them', () => {
    const { container, rerender } = render(<WarningList warnings={[]} />)
    expect(container).toBeEmptyDOMElement()

    rerender(<WarningList warnings={['Primeiro.', 'Segundo.']} />)

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })
})

describe('Select inside a scrollable window', () => {
  it('scrolls the open list into view', async () => {
    const scrollIntoView = vi.fn()
    HTMLElement.prototype.scrollIntoView = scrollIntoView
    render(
      <Select
        label="Status"
        value="a"
        onChange={() => {}}
        options={[{ value: 'a', label: 'A' }]}
      />,
    )

    await userEvent.click(screen.getByRole('combobox', { name: 'Status' }))

    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' })
    Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView')
  })
})
