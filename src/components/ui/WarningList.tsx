import { Alert } from './Alert'

/** Avisos que não impedem a ação: um alerta amarelo com cada um em uma linha. */
export function WarningList({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) return null

  return (
    <Alert variant="warning">
      <ul className="flex flex-col gap-1">
        {warnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
    </Alert>
  )
}
