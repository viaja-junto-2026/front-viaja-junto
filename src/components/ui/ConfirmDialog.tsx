import type { ReactNode } from 'react'
import { Button } from './Button'
import { Modal } from './Modal'

type ConfirmDialogProps = {
  open: boolean
  title: string
  /** Diga o que vai acontecer e se dá para desfazer. */
  description: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  /** Mostra o carregamento no botão de confirmar enquanto a ação roda. */
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Confirmação para ações destrutivas (excluir, remover, sair). O foco inicial fica em
 * "Cancelar", para que um Enter sem querer não apague nada.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Excluir',
  cancelLabel = 'Cancelar',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button variant="secondary" autoFocus onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="danger" loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {description}
    </Modal>
  )
}
