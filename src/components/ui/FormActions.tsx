import { Button } from './Button'

type FormActionsProps = {
  submitLabel: string
  submitting?: boolean
  onCancel: () => void
  /** Ação destrutiva do formulário de edição (por exemplo, "Excluir destino"). */
  remove?: { label: string; onClick: () => void }
}

/** Botões de um formulário em janela: excluir à parte, depois cancelar e salvar. */
export function FormActions({ submitLabel, submitting, onCancel, remove }: FormActionsProps) {
  return (
    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
      {remove && (
        <div className="flex flex-col sm:mr-auto">
          <Button variant="danger" onClick={remove.onClick}>
            {remove.label}
          </Button>
        </div>
      )}
      <Button variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" variant="solid" loading={submitting}>
        {submitLabel}
      </Button>
    </div>
  )
}
