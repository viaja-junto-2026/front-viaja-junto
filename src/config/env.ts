/**
 * Único ponto de leitura das variáveis de ambiente.
 * O resto do código importa `env` daqui, nunca `import.meta.env` direto.
 */
function required(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name} (see .env.example)`)
  }
  return value
}

export const env = {
  apiUrl: required('VITE_API_URL'),
} as const
