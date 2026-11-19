import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState, type ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'
import { ConfirmDialog } from './ConfirmDialog'
import { Modal } from './Modal'
import { Tabs } from './Tabs'

const tabs = [
  { id: 'itinerary', label: 'Roteiro', content: <p>Conteúdo do roteiro</p> },
  { id: 'budget', label: 'Orçamento', content: <p>Conteúdo do orçamento</p> },
  { id: 'members', label: 'Membros', content: <p>Conteúdo dos membros</p> },
]

describe('Tabs', () => {
  it('shows the first tab by default', () => {
    render(<Tabs tabs={tabs} label="Seções" />)

    expect(screen.getByRole('tablist', { name: 'Seções' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Roteiro' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Conteúdo do roteiro')
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Roteiro')
  })

  it('starts on the default tab and changes on click', async () => {
    const onValueChange = vi.fn()
    render(<Tabs tabs={tabs} label="Seções" defaultValue="budget" onValueChange={onValueChange} />)
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Conteúdo do orçamento')

    await userEvent.click(screen.getByRole('tab', { name: 'Membros' }))

    expect(screen.getByRole('tabpanel')).toHaveTextContent('Conteúdo dos membros')
    expect(onValueChange).toHaveBeenCalledWith('members')
  })

  it('works controlled: the parent decides the active tab', async () => {
    const onValueChange = vi.fn()
    render(<Tabs tabs={tabs} label="Seções" value="itinerary" onValueChange={onValueChange} />)

    await userEvent.click(screen.getByRole('tab', { name: 'Orçamento' }))

    expect(onValueChange).toHaveBeenCalledWith('budget')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Conteúdo do roteiro')
  })

  it('moves between tabs with the keyboard and keeps one tab in the tab order', async () => {
    render(<Tabs tabs={tabs} label="Seções" />)
    await userEvent.tab()
    expect(screen.getByRole('tab', { name: 'Roteiro' })).toHaveFocus()
    expect(screen.getByRole('tab', { name: 'Orçamento' })).toHaveAttribute('tabindex', '-1')

    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Orçamento' })).toHaveFocus()
    expect(screen.getByRole('tab', { name: 'Orçamento' })).toHaveAttribute('aria-selected', 'true')

    await userEvent.keyboard('{End}')
    expect(screen.getByRole('tab', { name: 'Membros' })).toHaveFocus()

    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Roteiro' })).toHaveFocus()

    await userEvent.keyboard('{ArrowLeft}')
    expect(screen.getByRole('tab', { name: 'Membros' })).toHaveFocus()

    await userEvent.keyboard('{Home}')
    expect(screen.getByRole('tab', { name: 'Roteiro' })).toHaveFocus()
  })

  it('ignores other keys', async () => {
    render(<Tabs tabs={tabs} label="Seções" />)
    await userEvent.tab()

    await userEvent.keyboard('a')

    expect(screen.getByRole('tab', { name: 'Roteiro' })).toHaveAttribute('aria-selected', 'true')
  })

  it('renders no panel when there are no tabs', () => {
    render(<Tabs tabs={[]} label="Vazio" />)

    expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument()
  })
})

function ModalExample({ onClose = () => {} }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Abrir</Button>
      <Modal
        open={open}
        onClose={() => {
          onClose()
          setOpen(false)
        }}
        title="Convidar"
        footer={<Button>Enviar</Button>}
      >
        <input aria-label="E-mail" />
      </Modal>
    </>
  )
}

describe('Modal', () => {
  it('renders nothing while closed', () => {
    render(
      <Modal open={false} onClose={() => {}} title="Título">
        Conteúdo
      </Modal>,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens as a named modal dialog with its content and footer', async () => {
    render(<ModalExample />)

    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }))

    expect(screen.getByRole('dialog', { name: 'Convidar' })).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument()
  })

  it('moves the focus into the dialog, locks the page scroll and restores both on close', async () => {
    render(<ModalExample />)
    const opener = screen.getByRole('button', { name: 'Abrir' })

    await userEvent.click(opener)
    expect(screen.getByRole('button', { name: 'Fechar' })).toHaveFocus()
    expect(document.body.style.overflow).toBe('hidden')

    await userEvent.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.body.style.overflow).toBe('')
    expect(opener).toHaveFocus()
  })

  it('closes with the close button and by clicking the backdrop', async () => {
    const onClose = vi.fn()
    render(<ModalExample onClose={onClose} />)

    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }))
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(onClose).toHaveBeenCalledTimes(1)

    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }))
    await userEvent.click(screen.getByRole('dialog').parentElement as HTMLElement)
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('does not close when clicking inside the dialog', async () => {
    const onClose = vi.fn()
    render(<ModalExample onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }))

    await userEvent.click(screen.getByRole('dialog'))

    expect(onClose).not.toHaveBeenCalled()
  })

  it('keeps the focus trapped inside the dialog', async () => {
    render(<ModalExample />)
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }))
    const close = screen.getByRole('button', { name: 'Fechar' })
    const send = screen.getByRole('button', { name: 'Enviar' })

    await userEvent.tab()
    expect(screen.getByLabelText('E-mail')).toHaveFocus()
    await userEvent.tab()
    expect(send).toHaveFocus()
    await userEvent.tab()
    expect(close).toHaveFocus()
    await userEvent.tab({ shift: true })
    expect(send).toHaveFocus()
  })
})

describe('ConfirmDialog', () => {
  function renderDialog(props: Partial<ComponentProps<typeof ConfirmDialog>> = {}) {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmDialog
        open
        title="Excluir viagem?"
        description="Isso não pode ser desfeito."
        onConfirm={onConfirm}
        onCancel={onCancel}
        {...props}
      />,
    )
    return { onConfirm, onCancel }
  }

  it('explains the action and starts with the focus on Cancel', () => {
    renderDialog()

    expect(screen.getByRole('dialog', { name: 'Excluir viagem?' })).toHaveTextContent(
      'Isso não pode ser desfeito.',
    )
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus()
  })

  it('confirms and cancels', async () => {
    const { onConfirm, onCancel } = renderDialog()

    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }))
    expect(onConfirm).toHaveBeenCalledOnce()

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('cancels with Esc', async () => {
    const { onCancel } = renderDialog()

    await userEvent.keyboard('{Escape}')

    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('accepts custom labels and shows the loading state on the confirm button', () => {
    renderDialog({ confirmLabel: 'Remover', cancelLabel: 'Voltar', loading: true })

    expect(screen.getByRole('button', { name: 'Voltar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remover' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Remover' })).toHaveAttribute('aria-busy', 'true')
  })
})
