import { QueryClient } from '@tanstack/react-query'

/**
 * Cria o cliente de cache das buscas. Os padrões valem para todas as telas:
 * os dados ficam "frescos" por 30 s, há uma nova tentativa em caso de falha e a janela
 * voltando ao foco não refaz a chamada sozinha (o usuário usa "Tentar de novo").
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })
}

/** Instância única usada pelo app (os testes criam a própria). */
export const queryClient = createQueryClient()
