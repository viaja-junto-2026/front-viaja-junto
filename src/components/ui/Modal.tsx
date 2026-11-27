import { X } from 'lucide-react'
import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { IconButton } from './IconButton'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Quantas janelas estão abertas. A rolagem só volta quando a última fecha: com uma
 * confirmação sobre um formulário, fechar as duas juntas não pode deixar a página travada.
 */
let openModals = 0
let overflowBeforeModals = ''

function lockScroll() {
  if (openModals === 0) overflowBeforeModals = document.body.style.overflow
  openModals += 1
  document.body.style.overflow = 'hidden'
}

function unlockScroll() {
  openModals -= 1
  if (openModals === 0) document.body.style.overflow = overflowBeforeModals
}

type ModalProps = {
  open: boolean
  /** Chamado ao apertar Esc, clicar no fundo ou no botão de fechar. */
  onClose: () => void
  title: string
  children: ReactNode
  /** Área de botões no rodapé (por exemplo, Cancelar e Salvar). */
  footer?: ReactNode
}

/**
 * Janela modal acessível: foco preso dentro dela, Esc fecha, a rolagem da página fica
 * travada e o foco volta ao elemento que a abriu. Se um elemento interno usar `autoFocus`,
 * ele recebe o foco inicial; caso contrário, o primeiro elemento focável.
 */
export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    lockScroll()

    const dialog = dialogRef.current
    if (dialog && !dialog.contains(document.activeElement)) {
      dialog.querySelector<HTMLElement>(FOCUSABLE)?.focus()
    }

    return () => {
      unlockScroll()
      previouslyFocused?.focus()
    }
  }, [open])

  if (!open) return null

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onClose()
      return
    }
    if (event.key !== 'Tab') return

    const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-gray-ink/50 sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleKeyDown}
        className="flex max-h-full w-full flex-col gap-4 overflow-y-auto rounded-xs border-t-4 border-t-brown-espresso bg-white p-6 text-gray-ink shadow-xl sm:max-w-lg"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="font-heading text-headline-sm text-brown-espresso">
            {title}
          </h2>
          <IconButton label="Fechar" variant="ghost" size="sm" onClick={onClose}>
            <X aria-hidden="true" size={20} />
          </IconButton>
        </div>
        <div className="text-body-md">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{footer}</div>
        )}
      </div>
    </div>,
    document.body,
  )
}
