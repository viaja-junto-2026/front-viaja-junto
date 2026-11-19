import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'

type UseApiMutationOptions<TData, TVariables> = {
  /** Função de serviço que cria, edita ou exclui (deve lançar erro quando a API falhar). */
  mutationFn: (variables: TVariables) => Promise<TData>
  /** Buscas que ficam desatualizadas depois do sucesso e são refeitas (ex.: a lista de viagens). */
  invalidateKeys?: QueryKey[]
  onSuccess?: (data: TData, variables: TVariables) => void
}

/**
 * Mutação (criar, editar ou excluir) que, ao dar certo, refaz as buscas listadas em
 * `invalidateKeys`. O erro fica em `error` e `isError` para a tela mostrar ao usuário.
 */
export function useApiMutation<TData, TVariables = void>({
  mutationFn,
  invalidateKeys = [],
  onSuccess,
}: UseApiMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient()

  return useMutation<TData, Error, TVariables>({
    mutationFn,
    onSuccess: async (data, variables) => {
      await Promise.all(
        invalidateKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      )
      onSuccess?.(data, variables)
    },
  })
}
