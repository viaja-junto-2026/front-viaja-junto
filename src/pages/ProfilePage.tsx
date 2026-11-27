import { useNavigate } from 'react-router'
import { useAuth } from '../auth/useAuth'
import { Button } from '../components/ui/Button'
import { paths } from '../routes/paths'
import { DisplayTitle } from '../components/ui/DisplayTitle'

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
      <DisplayTitle>Perfil</DisplayTitle>
      {user && (
        <>
          <p className="mt-2 text-title-md text-gray-ink">{user.name}</p>
          <p className="text-body-md text-gray-dim">{user.email}</p>
        </>
      )}
      <Button variant="secondary" className="mt-6" onClick={() => void handleSignOut()}>
        Sair
      </Button>
    </section>
  )
}
