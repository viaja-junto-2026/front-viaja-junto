import { DisplayTitle } from './ui/DisplayTitle'

interface ComingSoonProps {
  title: string
}

/**
 * Conteúdo provisório das páginas que ainda não foram implementadas.
 * Cada issue de tela substitui este componente pelo conteúdo real da página.
 */
export function ComingSoon({ title }: ComingSoonProps) {
  return (
    <section className="py-8">
      <DisplayTitle>{title}</DisplayTitle>
      <p className="mt-2 text-body-md text-gray-dim">Em breve.</p>
    </section>
  )
}
