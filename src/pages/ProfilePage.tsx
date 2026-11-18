import { useNavigate } from 'react-router'
import { useAuth } from '../auth/useAuth'
import { paths } from '../routes/paths'

/** Provisória: mostra quem está logado e permite sair. O restante do perfil é uma tela extra. */
export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    // Navega antes de limpar a sessão: do contrário a guarda de rotas veria o visitante
    // em /profile e o mandaria para o login (guardando /profile como destino de retorno).
    navigate(paths.home)
    await signOut()
  }

  return (
    <section className="py-8">
      <h1 className="text-headline-lg text-red-burgundy">Perfil</h1>
      {user && (
        <>
          <p className="mt-2 text-title-md text-gray-ink">{user.name}</p>
          <p className="text-body-md text-gray-dim">{user.email}</p>
        </>
      )}
      <button
        type="button"
        onClick={handleSignOut}
        className="mt-6 rounded-md border border-red-ruby bg-white px-6 py-3 text-label-lg text-red-ruby hover:bg-beige-sand"
      >
        Sair
      </button>
    </section>
  )
}
