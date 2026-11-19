import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { focusRing } from './focus'

export type TabItem = {
  id: string
  label: string
  /** Conteúdo do painel, exibido quando a aba está ativa. */
  content: ReactNode
}

type TabsProps = {
  tabs: TabItem[]
  /** Aba ativa (modo controlado). Sem ele, o componente guarda o estado sozinho. */
  value?: string
  defaultValue?: string
  onValueChange?: (id: string) => void
  /** Nome da lista de abas para leitores de tela, por exemplo "Seções da viagem". */
  label: string
}

/**
 * Abas com painéis. Teclado: setas esquerda e direita trocam de aba, Home e End vão
 * para a primeira e a última. A aba ativa tem texto Bordô e sublinhado Rubi de 3 px.
 */
export function Tabs({ tabs, value, defaultValue, onValueChange, label }: TabsProps) {
  const baseId = useId()
  const [innerValue, setInnerValue] = useState(defaultValue ?? tabs[0]?.id)
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const activeId = value ?? innerValue

  function select(id: string) {
    setInnerValue(id)
    onValueChange?.(id)
    tabRefs.current[id]?.focus()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = tabs.findIndex((tab) => tab.id === activeId)
    let next: number | null = null
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = tabs.length - 1
    if (next === null) return
    event.preventDefault()
    select(tabs[next].id)
  }

  const activeTab = tabs.find((tab) => tab.id === activeId)

  return (
    <div>
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={handleKeyDown}
        className="flex gap-6 overflow-x-auto overflow-y-hidden border-b border-beige-sand"
      >
        {tabs.map((tab) => {
          const selected = tab.id === activeId
          return (
            <button
              key={tab.id}
              ref={(element) => {
                tabRefs.current[tab.id] = element
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(tab.id)}
              className={`-mb-px h-12 shrink-0 border-b-3 text-label-lg whitespace-nowrap transition-colors ${
                selected
                  ? 'border-red-ruby text-red-burgundy'
                  : 'border-transparent text-gray-dim hover:text-red-burgundy'
              } ${focusRing}`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      {activeTab && (
        <div
          role="tabpanel"
          id={`${baseId}-panel-${activeTab.id}`}
          aria-labelledby={`${baseId}-tab-${activeTab.id}`}
          tabIndex={0}
          className={`pt-6 ${focusRing}`}
        >
          {activeTab.content}
        </div>
      )}
    </div>
  )
}
