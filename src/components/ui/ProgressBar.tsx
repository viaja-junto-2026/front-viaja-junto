type ProgressBarProps = {
  /** Valor atual. Acima do máximo, a barra fica cheia (quem usa deve mostrar um aviso). */
  value: number
  max?: number
  /** Nome da barra para leitores de tela, por exemplo "Orçamento consumido". */
  label: string
  className?: string
}

/** Barra de progresso: trilha bege e preenchimento Rubi, com semântica de `progressbar`. */
export function ProgressBar({ value, max = 100, label, className }: ProgressBarProps) {
  const ratio = max > 0 ? value / max : 0
  const percent = Math.round(Math.min(Math.max(ratio, 0), 1) * 100)

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(Math.max(value, 0), max)}
      className={`h-2 w-full overflow-hidden rounded-full bg-beige-sand ${className ?? ''}`.trim()}
    >
      <div className="h-full rounded-full bg-red-ruby" style={{ width: `${percent}%` }} />
    </div>
  )
}
