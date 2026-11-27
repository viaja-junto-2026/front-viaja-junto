import { Outlet, ScrollRestoration, useMatches } from 'react-router'
import { AppBar } from '../components/layout/AppBar'
import { BottomNav } from '../components/layout/BottomNav'
import { SiteFooter } from '../components/layout/SiteFooter'

type RouteHandle = {
  /** Tela em faixas de largura total: ela cuida das próprias margens (com `Container`). */
  fullBleed?: boolean
  /** Mostra o rodapé do site no fim da página (hoje, só na home). */
  footer?: boolean
}

/**
 * Layout das telas do app: barra superior, conteúdo e barra inferior (celular).
 * Por padrão o conteúdo tem largura máxima de 1200 px e margens de 16, 24 e 32 px por faixa
 * de tela. Rotas com `handle: { fullBleed: true }` ocupam a largura toda.
 */
export function AppLayout() {
  const matches = useMatches()
  const fullBleed = matches.some((match) => (match.handle as RouteHandle)?.fullBleed)
  const footer = matches.some((match) => (match.handle as RouteHandle)?.footer)

  return (
    <div className="min-h-screen">
      <AppBar />
      <main
        className={
          fullBleed
            ? 'w-full pb-20 lg:pb-0'
            : 'mx-auto w-full max-w-content px-4 pb-24 sm:px-6 lg:px-8 lg:pb-8'
        }
      >
        <Outlet />
        {footer && <SiteFooter />}
      </main>
      <BottomNav />
      {/* Página nova começa no topo; "voltar" retoma de onde a pessoa estava. */}
      <ScrollRestoration
        // Ao abrir um endereço direto a chave é sempre "default": sem o caminho,
        // uma página herdaria a rolagem de outra.
        getKey={({ key, pathname }) => (key === 'default' ? pathname : key)}
      />
    </div>
  )
}
