import { Bell } from 'lucide-react'
import { Link, NavLink } from 'react-router'
import { useAuth } from '../../auth/useAuth'
import { paths } from '../../routes/paths'
import { Avatar } from '../ui/Avatar'
import { ButtonLink } from '../ui/ButtonLink'
import { IconButtonLink } from '../ui/IconButton'
import { BrandLogo } from './BrandLogo'
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
          <BrandLogo alt="" size="md" />
          <span className="flex flex-col">
            <span className="font-heading text-headline-sm text-red-ruby">ViajaJunto</span>
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
              <IconButtonLink
                to={paths.notifications}
                label="Notificações"
                variant="brand"
                shape="round"
                size="md"
              >
                <Bell aria-hidden="true" size={20} />
              </IconButtonLink>
              <Link
                to={paths.profile}
                aria-label={`Perfil de ${user.name}`}
                className="hidden rounded-full lg:flex"
              >
                <Avatar name={user.name} />
              </Link>
            </>
          )}
          {status === 'unauthenticated' && (
            <ButtonLink to={paths.login} variant="solid">
              Entrar
            </ButtonLink>
          )}
        </div>
      </div>
    </header>
  )
}
