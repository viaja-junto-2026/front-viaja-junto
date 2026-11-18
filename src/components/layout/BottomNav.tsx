import { NavLink } from 'react-router'
import { bottomNavItems } from './navigation'

/** Barra de navegação inferior fixa, usada só no celular e no tablet (some a partir de lg). */
export function BottomNav() {
  return (
    <nav
      aria-label="Navegação inferior"
      className="fixed inset-x-0 bottom-0 z-10 flex h-18 bg-white shadow-md lg:hidden"
    >
      {bottomNavItems.map(({ label, to, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex min-h-11 flex-1 flex-col items-center justify-center gap-1 text-label-sm uppercase ${
              isActive ? 'text-red-burgundy' : 'text-gray-dim'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon aria-hidden="true" size={24} strokeWidth={isActive ? 2.25 : 2} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
