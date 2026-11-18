import { Outlet } from 'react-router'
import { AppBar } from '../components/layout/AppBar'
import { BottomNav } from '../components/layout/BottomNav'

/**
 * Layout das telas do app: barra superior, conteúdo e barra inferior (celular).
 * O conteúdo tem largura máxima de 1200 px e margens de 16, 24 e 32 px por faixa de tela.
 */
export function AppLayout() {
  return (
    <div className="min-h-screen">
      <AppBar />
      <main className="mx-auto w-full max-w-content px-4 pb-24 sm:px-6 lg:px-8 lg:pb-8">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
