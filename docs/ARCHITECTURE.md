# Arquitetura

> Documento vivo: atualizar sempre que uma decisão de arquitetura mudar.

## Visão geral

SPA em React que consome a API do back-end (T2, submodule em `backend/`). Todo acesso ao back fica isolado em uma camada de serviços. Front e back sobem juntos com `docker compose up`.

## Stack e bibliotecas

Parte das ferramentas (pnpm, ESLint, Prettier, Vitest e o pipeline de CI) foi reaproveitada de um projeto anterior do grupo (AGES 2), porque já conhecemos a configuração e ela já foi validada.

| Biblioteca                                            | Para que serve           | Por que escolhemos                                                                                               |
| ----------------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| React, Vite, TypeScript                               | Base do projeto          | Exigidos pelo enunciado. O Vite dá build e HMR rápidos; o TS evita erros de contrato com a API.                  |
| Tailwind CSS v4                                       | Estilos                  | Os tokens ficam em um único bloco `@theme`, e as classes são geradas a partir dele (ver "Design tokens").        |
| pnpm                                                  | Gerenciador de pacotes   | Instalação rápida, lockfile estrito (`--frozen-lockfile`) e `pnpm audit` usado no CI.                            |
| ESLint, typescript-eslint, plugins de React           | Lint                     | Padrão do ecossistema. Também aplica a regra que proíbe valores soltos de estilo.                                |
| Prettier, eslint-config-prettier                      | Formatação               | Formatação única para o time, sem conflito com o ESLint.                                                         |
| Vitest, Testing Library, jsdom, `@vitest/coverage-v8` | Testes e cobertura       | Vitest usa a mesma config do Vite. Testing Library testa pelo comportamento do usuário. Cobertura mínima de 70%. |
| jiti                                                  | Ler `eslint.config.ts`   | Permite a configuração do ESLint em TypeScript, sem nenhum arquivo JS no projeto.                                |
| nginx                                                 | Servir o build no Docker | Imagem pequena e fallback para rotas da SPA.                                                                     |
| openapi-typescript                                    | Gerar tipos do contrato  | Gera só tipos (sem código em runtime) a partir do OpenAPI do back-end, então o TS acusa qualquer divergência.    |
| openapi-fetch                                         | Cliente HTTP tipado      | Cliente leve (sobre `fetch`) que usa os tipos gerados; não adiciona dependências pesadas.                        |

Bibliotecas que ainda vamos adicionar (roteador, etc.) devem ser registradas nesta tabela com a justificativa.

## Estrutura de pastas

```
src/
  components/   componentes de UI reutilizáveis
  hooks/        hooks customizados
  pages/        telas
  services/     camada de acesso à API (única que fala com o back)
  config/       configuração (env.ts lê as variáveis de ambiente)
  styles/       design tokens (tokens.css)
  types/        tipos compartilhados
  test/         setup dos testes
docker/         arquivos de apoio do Docker (nginx.conf)
docs/           documentação
backend/        submodule do back-end (somente leitura)
```

## Camada de API

Todo acesso ao back-end fica em `src/services/`. Ela é gerada a partir do contrato OpenAPI:

- `src/services/openapi.json`: cópia do contrato, gerada pelo script `openapi:generate` do back-end (`npm run openapi:generate`). Como o back-end não vai mudar e o submodule fixa a versão, a cópia fica no repositório.
- `src/services/generated/schema.ts`: tipos gerados pelo `pnpm api:generate`. Não editar à mão; fica fora do lint, da formatação e da cobertura.
- `src/services/apiClient.ts`: único cliente HTTP (`openapi-fetch`), com a URL vinda de `VITE_API_URL`.
- Funções de serviço (uma por recurso) usam o `apiClient`. Hooks e telas chamam apenas essas funções, nunca o `fetch`.
- O CI roda `pnpm api:generate` e falha se os tipos gerados estiverem desatualizados.
- `VITE_API_URL` é só a origem (`http://localhost:3000`): as rotas do contrato já incluem o prefixo `/api`.

Para atualizar o contrato, se o back-end mudar: gerar um novo `openapi.json`, copiar para `src/services/` e rodar `pnpm api:generate`.

## Design tokens e estilos

Cores, fontes, raios e sombras ficam somente em `src/styles/tokens.css` (bloco `@theme`). A paleta padrão do Tailwind está desativada, então só existem as cores definidas ali. O ESLint bloqueia valores arbitrários (`w-[137px]`, `bg-[#fff]`) e cores hexadecimais soltas.

## Componentes e hooks

_A definir._

## Tratamento de erro, carregamento e estado vazio

_A definir._

## Testes

- **Unitários e de componente:** Vitest + Testing Library. Mocks são permitidos apenas nos testes; a aplicação em si sempre usa o back-end real.
- **Cobertura mínima de 70%** (statements, branches, functions e lines). O `pnpm test:coverage` falha abaixo disso, e o CI também.

## Docker e CI

- **Docker:** o `docker-compose.yml` da raiz inclui o compose do back-end (submodule) e adiciona o front. `docker compose up --build` sobe Postgres, migrations, API e front, com dados de demonstração.
- **CI** (`.github/workflows/ci.yml`), a cada push e PR para `main`, `develop` e `deploy`:
  - `CI audit`: `pnpm audit` das dependências (também roda todo dia).
  - `CI quality`: lint, formatação, tipos, testes com cobertura e build.
  - `CI docker`: valida o compose e faz o build da imagem do front.
- `main` e `develop` são protegidas: PR com 1 aprovação e checks do CI obrigatórios.

## Decisões

| Data       | Decisão                                     | Motivo                                        |
| ---------- | ------------------------------------------- | --------------------------------------------- |
| 2026-11-17 | Tailwind v4 com tokens em `@theme`          | Tokens centralizados e verificáveis por lint  |
| 2026-11-17 | Mocks só em testes; app usa o back-end real | Requisito do professor                        |
| 2026-11-17 | Cobertura mínima de 70%                     | Requisito do professor                        |
| 2026-11-17 | openapi-typescript + openapi-fetch          | Só tipos gerados; serviços e hooks são nossos |
