# Arquitetura

> Documento vivo: atualizar sempre que uma decisão de arquitetura mudar.

## Visão geral

SPA em React que consome a API do back-end (T2, submodule em `backend/`). Todo acesso ao back fica isolado em uma camada de serviços. Front e back sobem juntos com `docker compose up`.

## Stack e bibliotecas

Parte das ferramentas (pnpm, ESLint, Prettier, Vitest e o pipeline de CI) foi reaproveitada de um projeto anterior do grupo (AGES 2), porque já conhecemos a configuração e ela já foi validada.

| Biblioteca                                                 | Para que serve           | Por que escolhemos                                                                                                                                                               |
| ---------------------------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React, Vite, TypeScript                                    | Base do projeto          | Exigidos pelo enunciado. O Vite dá build e HMR rápidos; o TS evita erros de contrato com a API.                                                                                  |
| Tailwind CSS v4                                            | Estilos                  | Os tokens ficam em um único bloco `@theme`, e as classes são geradas a partir dele (ver "Design tokens").                                                                        |
| pnpm                                                       | Gerenciador de pacotes   | Instalação rápida, lockfile estrito (`--frozen-lockfile`) e `pnpm audit` usado no CI.                                                                                            |
| ESLint, typescript-eslint, plugins de React                | Lint                     | Padrão do ecossistema. Também aplica a regra que proíbe valores soltos de estilo.                                                                                                |
| Prettier, eslint-config-prettier                           | Formatação               | Formatação única para o time, sem conflito com o ESLint.                                                                                                                         |
| Vitest, Testing Library, jsdom, `@vitest/coverage-v8`      | Testes e cobertura       | Vitest usa a mesma config do Vite. Testing Library testa pelo comportamento do usuário. Cobertura mínima de 70%.                                                                 |
| `@fontsource` (DM Serif Display, Plus Jakarta Sans, Inter) | Fontes da interface      | Fontes do design system hospedadas no projeto: sem requisição ao Google Fonts, funcionam offline e no Docker.                                                                    |
| lucide-react                                               | Ícones                   | Traço limpo e arredondado que combina com o design, com os ícones de viagem necessários, tipado e importado ícone a ícone (bundle leve).                                         |
| jiti                                                       | Ler `eslint.config.ts`   | Permite a configuração do ESLint em TypeScript, sem nenhum arquivo JS no projeto.                                                                                                |
| nginx                                                      | Servir o build no Docker | Imagem pequena e fallback para rotas da SPA.                                                                                                                                     |
| openapi-typescript                                         | Gerar tipos do contrato  | Gera só tipos (sem código em runtime) a partir do OpenAPI do back-end, então o TS acusa qualquer divergência.                                                                    |
| openapi-fetch                                              | Cliente HTTP tipado      | Cliente leve (sobre `fetch`) que usa os tipos gerados; não adiciona dependências pesadas.                                                                                        |
| react-router                                               | Rotas e navegação        | Padrão de mercado para SPAs em React: rotas aninhadas (layout compartilhado), links com item ativo (`aria-current`), rota de erro e roteador em memória para testar a navegação. |

| clsx | Juntar classes condicionais | Minúscula (menos de 1 KB) e sem dependências. Evita montar strings de classe na mão. |
| class-variance-authority (cva) | Variantes dos componentes | Declara as variantes (`primary`, `secondary`...) em um objeto tipado: o TypeScript acusa variante inexistente e o estilo de cada uma fica num lugar só. |

| @tanstack/react-query | Busca de dados, cache e mutações | Cache, `refetch`, estados de carregamento e erro e invalidação depois de criar, editar ou excluir já vêm prontos (ver "Tratamento de erro, carregamento e estado vazio"). Alternativa descartada: hook próprio. |

Não usamos `tailwind-merge`: os componentes não sobrescrevem classes uns dos outros, e as escalas de design estão fechadas pelos tokens, então não há conflito de classes a resolver.

Bibliotecas que ainda vamos adicionar devem ser registradas nesta tabela com a justificativa.

## Estrutura de pastas

```
src/
  auth/         sessão do usuário (AuthProvider, useAuth, RequireAuth)
  components/   componentes de UI reutilizáveis
    ui/         componentes base do design system (Button, Input, Card, Modal...)
    layout/     barra superior (AppBar), barra inferior (BottomNav) e itens de navegação
    feedback/   estados de carregamento, erro e vazio (Spinner, LoadingSkeleton, ErrorState, EmptyState, QueryState)
  hooks/        hooks de dados (usePaginatedQuery, useApiMutation) e hooks das telas
  layouts/      layouts de tela (AppLayout: barra superior, conteúdo e barra inferior)
  pages/        telas (uma página por rota; as seções de uma tela ficam em uma pasta própria, como `pages/home/`)
  routes/       caminhos (paths.ts) e tabela de rotas (routes.tsx)
  services/     camada de acesso à API (única que fala com o back)
  config/       configuração (env.ts lê as variáveis de ambiente)
  styles/       design tokens (tokens.css)
  types/        tipos compartilhados
  utils/        funções puras compartilhadas (format, labels, errorMessages, getInitials...)
  test/         setup dos testes
docker/         arquivos de apoio do Docker (nginx.conf)
docs/           documentação
backend/        submodule do back-end (somente leitura)
```

## Rotas e layout

- **Caminhos:** `src/routes/paths.ts` é o único lugar com os caminhos. Use `paths.trips`, `paths.tripDetails(id)` etc. para links e redirects; nunca escreva a URL na mão.
- **Tabela de rotas:** `src/routes/routes.tsx`. `/login` e `/auth/callback` ficam fora do layout principal; todas as outras ficam dentro do `AppLayout`.
- **Layout (`AppLayout`):** barra superior (`AppBar`) + conteúdo (`max-w-content`, margens de 16, 24 e 32 px) + barra inferior (`BottomNav`). No desktop (a partir de `lg`) aparece o menu na barra superior; no celular o menu vira a barra inferior fixa.
- **Erros:** uma rota que quebra mostra o `ErrorPage` dentro do layout, sem perder a navegação. Endereço inexistente mostra o `NotFoundPage`.
- **Como adicionar uma tela:** crie a página em `src/pages/`, troque o componente provisório da rota em `routes.tsx` e, se a rota for nova, acrescente o caminho em `paths.ts`. As páginas ainda sem conteúdo usam o `ComingSoon` e devem ser substituídas pela issue da tela.
- **Testes de navegação:** use `createMemoryRouter(routes, { initialEntries: [...] })` (ver `src/routes/routes.test.tsx`).

## Autenticação

O login é só com Google (ver `docs/SCOPE.md`). Esta base cuida da sessão; as telas de login e de retorno usam as peças abaixo.

- **Token:** guardado em `localStorage` junto com o horário de expiração (`expires_in`), em `src/services/session.ts`. Assim a sessão sobrevive a recarregar a página, mas um token expirado nunca é usado. O token dura cerca de 1 hora e o React escapa o conteúdo por padrão (não usamos `dangerouslySetInnerHTML`), o que reduz o risco de XSS roubar o token. O token nunca vai para logs nem para a URL depois do login.
- **Chamadas:** o `apiClient` tem um middleware que envia `Authorization: Bearer <token>` quando há sessão. Se a API responde **401**, a sessão é descartada e a interface é avisada.
- **Estado:** `AuthProvider` (em `App.tsx`) expõe `useAuth()` com `status` (`loading`, `authenticated` ou `unauthenticated`), `user`, `signIn(token, expiresInSeconds)` e `signOut()`. Com token guardado, o provider confirma o usuário em `GET /auth/me` antes de liberar o app.
- **Rotas privadas:** `RequireAuth` envolve as rotas que exigem login (`/trips*`, `/join`, `/notifications` e `/profile`). Sem sessão, a página continua dentro do layout (a barra e a aba ativa ficam visíveis) e mostra o aviso "Entre para continuar" com o botão Entrar. Ao clicar, o botão guarda a página pedida com `saveRedirectTarget` e leva para `/login`; depois do login, a tela de retorno lê o destino com `consumeRedirectTarget`. Só caminhos internos são aceitos, para ninguém ser levado a outro site.
- **Sair:** `signOut()` chama `POST /auth/logout` (invalida os tokens do usuário em todos os dispositivos) e descarta o token mesmo que a chamada falhe.
- **Testes:** use `AuthContext.Provider` com `makeAuthValue()` (em `src/test/auth.ts`) para simular usuário logado, visitante ou carregando.

## Camada de API

Todo acesso ao back-end fica em `src/services/`. Ela é gerada a partir do contrato OpenAPI:

- `src/services/openapi.json`: cópia do contrato, gerada pelo script `openapi:generate` do back-end (`npm run openapi:generate`). Como o back-end não vai mudar e o submodule fixa a versão, a cópia fica no repositório.
- `src/services/generated/schema.ts`: tipos gerados pelo `pnpm api:generate`. Não editar à mão; fica fora do lint, da formatação e da cobertura.
- `src/services/apiClient.ts`: único cliente HTTP (`openapi-fetch`), com a URL vinda de `VITE_API_URL`.
- Funções de serviço (uma por recurso) usam o `apiClient` e devolvem o resultado com `unwrap(...)`, que lança um `ApiError` quando a API falha. Hooks e telas chamam apenas essas funções, nunca o `fetch`.
- O CI roda `pnpm api:generate` e falha se os tipos gerados estiverem desatualizados.
- `VITE_API_URL` é só a origem (`http://localhost:3000`): as rotas do contrato já incluem o prefixo `/api`.

Para atualizar o contrato, se o back-end mudar: gerar um novo `openapi.json`, copiar para `src/services/` e rodar `pnpm api:generate`.

## Design tokens e estilos

Cores, fontes, estilos de texto, raios, sombras e breakpoints ficam somente em `src/styles/tokens.css` (bloco `@theme`). As escalas padrão do Tailwind estão desativadas, então só existe o que foi definido ali. O ESLint bloqueia valores arbitrários (`w-[137px]`, `bg-[#fff]`) e cores hexadecimais soltas. As escolhas visuais (paleta, tipografia, layout responsivo e componentes) estão documentadas em [DESIGN.md](DESIGN.md).

## Componentes e hooks

Os componentes base do design system ficam em `src/components/ui/`. Cada tela monta a interface com eles, sem repetir estilos.

| Componente                                               | Uso                                                                                                                                                |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`                                                 | Variantes `primary`, `secondary`, `compact`, `danger` (com lixeira), `solid`, `outline` e `light`; `loading`, `leftIcon`, `disabled` e `fullWidth` |
| `Input`, `Textarea`, `Select`                            | Rótulo, texto de ajuda e `error` (ícone + mensagem, `aria-invalid` e `aria-describedby`)                                                           |
| `Card`, `CardCompact`, `CardTitle`                       | Conteúdo principal e itens repetidos; `interactive` para card clicável                                                                             |
| `Badge`, `Chip`                                          | Status da viagem (`PLANNING`, `CONFIRMED`, `COMPLETED`) e filtros (`selected`)                                                                     |
| `Avatar`, `AvatarGroup`                                  | Iniciais e avatares empilhados com "+N"                                                                                                            |
| `Alert`                                                  | `success`, `warning`, `error` e `info`, sempre com ícone e texto                                                                                   |
| `Tabs`, `ProgressBar`                                    | Abas com painéis e teclado; barra de progresso com `role="progressbar"`                                                                            |
| `Modal`, `ConfirmDialog`                                 | Janela com foco preso, Esc e rolagem travada; confirmação de ação destrutiva                                                                       |
| `ButtonLink`, `TextLink`                                 | Link com a aparência de botão e link de texto com seta ("Ver todas")                                                                               |
| `IconButton`, `IconButtonLink`                           | Botão ou link só com ícone (`brand`, `surface`, `ghost`), com `label` obrigatório                                                                  |
| `IconCircle`, `SectionHeader`                            | Ícone em círculo tingido e cabeçalho de faixa (título e ações)                                                                                     |
| `Carousel`                                               | Faixa horizontal com `scroll-snap`; setas só no desktop                                                                                            |
| `FloatingCard`                                           | Card que flutua sobre uma foto, com sombra ampla                                                                                                   |
| `Pagination`, `FilterPanel`                              | Navegação entre páginas e caixa de busca e filtros das listas                                                                                      |
| `PageMessage`, `BackLink`, `ExternalTextLink`            | Mensagem de página inteira (não encontrado, erro), link de voltar e link externo                                                                   |
| `Tag`, `CoverPhoto`, `BrandLogo`                         | Selo de categoria, foto de capa com fallback e o logo                                                                                              |
| `SectionTitle`, `PromoBanner`, `Container`, `SiteFooter` | Peças das telas em faixas de largura total (home)                                                                                                  |
| `PageBanner`, `DetailHero`, `AuthShell`                  | Topo das listas, topo das páginas de detalhe e moldura do login                                                                                    |
| `TicketCard`, `CurvedEdge`, `CompassDivider`             | Cartão de embarque do login, curva ao lado da foto e filete dos títulos                                                                            |
| `FlightRoute`                                            | Rota tracejada nas laterais do título das listas                                                                                                   |
| `DisplayTitle`, `LocationLine`, `RatingSummary`          | Título em serifa, localização e resumo da nota dos topos de detalhe                                                                                |
| `BandOverlap`                                            | Faz o fundo do topo continuar até a metade do bloco seguinte                                                                                       |
| `DestinationShowcaseCard`, `FlushCard`                   | Card de destino (home e catálogo) e card sem respiro interno, para itens com foto                                                                  |

- **Como compor estilos:** `cva` declara as variantes e `clsx` junta classes condicionais. Só entram classes geradas pelos tokens (o ESLint barra valores arbitrários). O lint também **proíbe `<button>`, `<input>`, `<select>` e `<textarea>` fora de `src/components/ui/`**: use os componentes.
- **Acessibilidade:** elementos semânticos (`button`, `label`, `dialog`), foco visível por teclado (`focusRing`, em `ui/focus.ts`) e o estado nunca depende só da cor.
- **Ícones:** `lucide-react`, com `aria-hidden="true"` quando decorativos.
- **Modal:** feito sem biblioteca (poucas linhas) para não depender de um pacote só para prender o foco. Sempre use `ConfirmDialog` antes de excluir ou remover algo.
- **Regra:** use os componentes existentes ou crie um novo em `src/components/`. Nada de botão, campo, card ou aviso montado "solto" na página (regra 7 do `RULES.md`).
- **Hooks:** a pasta `src/hooks/` tem os hooks de dados (próxima seção).

## Tratamento de erro, carregamento e estado vazio

Toda tela que busca dados precisa tratar **carregando, erro e vazio**. Os blocos prontos ficam em `src/components/feedback/`:

| Componente        | Uso                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------- |
| `LoadingSkeleton` | Forma do conteúdo enquanto carrega (`text`, `card` ou `list`)                       |
| `Spinner`         | Indicador pequeno, para ações (salvar, enviar)                                      |
| `ErrorState`      | Mensagem em pt-BR e botão "Tentar de novo" (`onRetry`)                              |
| `EmptyState`      | Ícone, uma frase e o botão da ação ("Você ainda não tem viagens. Crie a primeira!") |
| `QueryState`      | Escolhe entre carregando, erro, vazio e conteúdo, nessa ordem                       |

**Por que TanStack Query e não um hook próprio (`useAsync`)?** O hook próprio é pequeno, mas cada tela acabaria reescrevendo cache, nova tentativa, refazer a lista depois de uma mutação e evitar chamadas repetidas, com risco de erro. A biblioteca já faz isso, é padrão de mercado e custa cerca de 13 KB (gzip). O hook próprio só ganharia em tamanho.

**Peças:**

- `src/services/queryClient.ts`: cliente de cache do app (dados frescos por 30 s, 1 nova tentativa, sem refazer ao voltar para a janela). O `QueryClientProvider` está em `App.tsx`.
- `useQuery` (da própria biblioteca): busca um item ou uma lista simples.
- `usePaginatedQuery`: lista com `page`, `limit` e filtros, no formato `{ data, meta }` da API. Mudar filtro ou `limit` volta para a página 1, e a página anterior fica na tela enquanto a nova carrega.
- `useApiMutation`: criar, editar ou excluir; ao dar certo, refaz as buscas de `invalidateKeys`. O erro fica em `error` e `isError`.
- Funções de serviço (`src/services/`) devem **lançar erro** quando a API falhar, para os hooks perceberem: use `unwrap`, que lança o `ApiError`. Passe `error` ao `QueryState` para a mensagem sair em português.

**Exemplo de uma tela de lista:**

```tsx
function TripsPage() {
  const trips = usePaginatedQuery({
    queryKey: ['trips'],
    queryFn: ({ page, limit, status }) => getTrips({ page, limit, status }), // serviço
  })

  return (
    <QueryState
      isLoading={trips.isLoading}
      isError={trips.isError}
      isEmpty={trips.isEmpty}
      onRetry={trips.refetch}
      loading={<LoadingSkeleton variant="card" />}
      empty={
        <EmptyState
          icon={Plane}
          title="Você ainda não tem viagens. Crie a primeira!"
          action={<Button onClick={goToNewTrip}>Nova viagem</Button>}
        />
      }
    >
      {trips.items.map((trip) => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </QueryState>
  )
}

// Excluir e refazer a lista:
const remove = useApiMutation({ mutationFn: deleteTrip, invalidateKeys: [['trips']] })
```

**Testes:** use `createQueryWrapper()` (em `src/test/query.tsx`) como `wrapper` do `render` ou `renderHook`. Ele cria um cache sem nova tentativa, para o erro aparecer na hora.

## Formatação e erros da API

Valores e mensagens padronizados, para todas as telas mostrarem a mesma coisa. Nunca formate na mão (`toFixed`, `toLocaleString` solto) nem escreva mensagens de erro de API na tela.

**Formatação** (`src/utils/format.ts`, seguindo o `DESIGN.md`):

| Função                            | Exemplo                                                                                                       |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `formatCurrency(1250)`            | `R$ 1.250,00` (orçamento e custo de atividade vêm em valor decimal)                                           |
| `formatCurrencyFromCents(125000)` | `R$ 1.250,00` (**despesas** vêm em centavos)                                                                  |
| `formatDate('2027-03-12')`        | `12 mar. 2027`                                                                                                |
| `formatDateRange(início, fim)`    | `12 de mar. – 2 de abr. de 2027` (mesmo mês: `12 – 20 de mar. de 2027`; anos diferentes mostram os dois anos) |
| `nightsBetween(início, fim)`      | número de noites (nunca negativo)                                                                             |
| `daysUntil(data)`                 | dias até a data (`0` é hoje, negativo é passado)                                                              |

As datas da API são dias de calendário e são tratadas em UTC, para o dia não mudar com o fuso do navegador. Uma data inválida vira `—`. Mostre valores com `numeric-*` e a classe `tabular`.

**Nomes de domínio** (`src/utils/labels.ts`): `tripStatusLabels`, `destinationCategoryLabels`, `activityTypeLabels` e `memberRoleLabels` traduzem os valores da API (`BEACH`, `PLANNING`, `VIEWER`...) para a interface. O `Badge` já usa `tripStatusLabels`.

**Erros da API:**

- `ApiError` (`src/services/apiError.ts`) tem `status`, `message` (para quem desenvolve) e `issues`. Em um 422, `issues` e `fieldErrors` trazem um item por campo, com o texto em português, prontos para o formulário: `error.fieldErrors.name` vira "deve ter pelo menos 2 caracteres".
- `unwrap(await apiClient.GET(...))` devolve os dados ou lança o `ApiError`. Toda função de serviço deve terminar assim.
- `getErrorMessage(error)` (`src/utils/errorMessages.ts`) devolve a mensagem em português para o usuário: 401, 403, 404, 409, 422 (listando os campos), 429, erro do servidor e falha de rede (o `fetch` lança `TypeError`).

```ts
// serviço
export async function getTrip(id: string) {
  return unwrap(await apiClient.GET('/api/trips/{id}', { params: { path: { id } } }))
}

// formulário: erro por campo e mensagem geral
const create = useApiMutation({ mutationFn: createTrip })
const fieldErrors = create.error instanceof ApiError ? create.error.fieldErrors : {}
// <Input label="Nome" error={fieldErrors.name} />
// {create.isError && <Alert variant="error">{getErrorMessage(create.error)}</Alert>}
```

## Exemplo de tela: a Home

A Home (`src/pages/HomePage.tsx`) é a tela de referência para quem for criar as outras. Ela junta todas as peças acima:

- **Service:** `listTopDestinations` (`src/services/destinations.ts`) usa o `apiClient` e `unwrap`.
- **Hook:** `useTopDestinations` (`src/hooks/useTopDestinations.ts`) é um `useQuery` com a chave e a função do service.
- **Seções em uma pasta própria** (`src/pages/home/`): `HomeHero`, `HomeFeatures` e `TopDestinationsSection`. A página só as monta.
- **Estados:** `TopDestinationsSection` mostra carregando (`LoadingSkeleton`), erro com "Tentar de novo" e vazio (`EmptyState`) usando o `QueryState`, e o conteúdo em uma grade de `DestinationShowcaseCard`.
- **Componentes, não estilos soltos:** botões e links via `ButtonLink` e `TextLink`, cards via `Card` e `FlushCard`.
- **Testes:** `HomePage.test.tsx` cobre cada estado, mockando só o service com `vi.mock`.

Pontos de atenção:

- A foto do hero é `src/assets/hero-tokyo.webp`.
- `GET /api/destination-catalog/top` só lista destinos que já têm avaliação. No catálogo de demonstração ainda não há nenhuma, então a faixa mostra o estado vazio até alguém concluir uma viagem e avaliar um destino. Os destinos do catálogo de demonstração também não têm foto: o card usa o bege com o ícone.

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

| Data       | Decisão                                          | Motivo                                                                                     |
| ---------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| 2026-11-17 | Tailwind v4 com tokens em `@theme`               | Tokens centralizados e verificáveis por lint                                               |
| 2026-11-17 | Mocks só em testes; app usa o back-end real      | Requisito do professor                                                                     |
| 2026-11-17 | Cobertura mínima de 70%                          | Requisito do professor                                                                     |
| 2026-11-17 | openapi-typescript + openapi-fetch               | Só tipos gerados; serviços e hooks são nossos                                              |
| 2026-11-18 | Paleta rubi, bordô e rosa antigo sobre bege      | Identidade visual escolhida pelo grupo (DESIGN.md)                                         |
| 2026-11-18 | Fontes hospedadas com `@fontsource`              | Sem dependência do Google Fonts em tempo de execução                                       |
| 2026-11-18 | Ícones com `lucide-react`                        | Estilo combina com o design; ícones de viagem cobertos                                     |
| 2026-11-18 | Rotas com react-router e um layout compartilhado | Navegação única e responsiva; cada tela só preenche a sua página                           |
| 2026-11-18 | Token da sessão em localStorage com expiração    | Sessão sobrevive ao recarregar e nunca usa token vencido; risco de XSS reduzido pelo React |
| 2026-11-18 | Componentes com `cva` + `clsx`, modal próprio    | Variantes tipadas, sem `tailwind-merge` e sem biblioteca só para o modal                   |
| 2026-11-18 | TanStack Query para buscas e mutações            | Cache, refetch e invalidação prontos; evita cada tela reescrever isso                      |
| 2026-11-18 | `ApiError` + `unwrap` e textos de erro em pt-BR  | Toda tela mostra as mesmas mensagens; 422 devolve o erro por campo                         |
