import { Bell, Compass } from 'lucide-react'
import { Link, NavLink } from 'react-router'
import { getInitials } from '../../auth/getInitials'
import { useAuth } from '../../auth/useAuth'
import { paths } from '../../routes/paths'
import { topNavItems } from './navigation'

/**
 * Barra superior. No desktop mostra marca, navegação, notificações e perfil;
 * no celular mostra só a marca e as notificações (a navegação fica na barra inferior).
 * Quem não está logado vê o botão "Entrar" no lugar das notificações e do perfil.
 */
export function AppBar() {
  const { status, user } = useAuth()

  return (
    <header className="bg-white">
      <div className="mx-auto flex h-18 w-full max-w-content items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          to={paths.home}
          aria-label="ViajaJunto, ir para a página inicial"
          className="flex items-center gap-3"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-beige-sand text-red-ruby">
            <Compass aria-hidden="true" size={20} />
          </span>
          <span className="flex flex-col">
            <span className="font-heading text-headline-sm text-red-burgundy">ViajaJunto</span>
            <span className="hidden text-body-sm text-gray-dim lg:block">Viagens em grupo</span>
          </span>
        </Link>

        <nav
          aria-label="Navegação principal"
          className="hidden flex-1 justify-center gap-8 lg:flex"
        >
          {topNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative px-2 py-3 text-label-lg ${isActive ? 'text-red-burgundy' : 'text-gray-dim'}`
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-red-ruby"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {status === 'authenticated' && user && (
            <>
              <Link
                to={paths.notifications}
                aria-label="Notificações"
                className="flex size-12 items-center justify-center rounded-full bg-white text-red-burgundy shadow-md"
              >
                <Bell aria-hidden="true" size={20} />
              </Link>
              <Link
                to={paths.profile}
                aria-label={`Perfil de ${user.name}`}
                className="hidden size-10 items-center justify-center rounded-full bg-rose-vintage text-label-md text-gray-ink lg:flex"
              >
                {getInitials(user.name)}
              </Link>
            </>
          )}
          {status === 'unauthenticated' && (
            <Link
              to={paths.login}
              className="rounded-full bg-red-ruby px-6 py-3 text-label-lg text-white hover:bg-red-burgundy"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
