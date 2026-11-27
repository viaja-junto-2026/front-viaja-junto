import { Outlet, useMatches } from 'react-router'
import { AppBar } from '../components/layout/AppBar'
import { BottomNav } from '../components/layout/BottomNav'
import { SiteFooter } from '../components/layout/SiteFooter'

type RouteHandle = {
  /** Tela em faixas de largura total: ela cuida das próprias margens (com `Container`). */
  fullBleed?: boolean
}

/**
 * Layout das telas do app: barra superior, conteúdo e barra inferior (celular).
 * Por padrão o conteúdo tem largura máxima de 1200 px e margens de 16, 24 e 32 px por faixa
 * de tela. Rotas com `handle: { fullBleed: true }` ocupam a largura toda.
 */
export function AppLayout() {
  const fullBleed = useMatches().some((match) => (match.handle as RouteHandle)?.fullBleed)

  return (
    <div className="min-h-screen">
      <AppBar />
      <main
        className={
          fullBleed
            ? 'w-full pb-16 lg:pb-0'
            : 'mx-auto w-full max-w-content px-4 pb-24 sm:px-6 lg:px-8 lg:pb-8'
        }
      >
        <Outlet />
        {fullBleed && <SiteFooter />}
      </main>
      <BottomNav />
    </div>
  )
}
