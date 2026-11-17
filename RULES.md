# Regras do Projeto

Estas regras valem para todas as pessoas que trabalham neste repositório, humanas ou assistentes de IA.

1. **Idioma.** A regra é simples: o que é **código** fica em inglês; o que é **texto escrito para humanos** fica em português (pt-BR).
   - **OBRIGATORIAMENTE em inglês (sem exceção):**
     - nomes de variáveis, constantes, funções, hooks, componentes, classes, tipos, interfaces e enums;
     - nomes de arquivos e pastas (ex.: `TripCard.tsx`, `useTrips.ts`, não `CartaoViagem.tsx`);
     - nomes de props, chaves de objetos, rotas e variáveis de ambiente;
     - descrições e nomes dos testes (`describe` / `it`) e mensagens de erro lançadas no código;
     - configuração (ESLint, Vite, CI, tsconfig etc.).
   - **Em português (pt-BR) — permitido e esperado:**
     - comentários no código;
     - títulos e corpo de commits;
     - títulos e descrições de pull requests;
     - README, este arquivo e qualquer outro documento (`docs/`);
     - textos exibidos ao usuário final na interface (ex.: "Olá, seja bem-vindo").
   - **Exemplo correto:** `const tripList = await getTrips() // busca as viagens do usuário`
   - **Exemplo errado:** `const listaViagens = await buscarViagens()`
   - Em caso de dúvida: se o compilador ou o navegador lê, é inglês; se só uma pessoa lê, é português.
2. **NUNCA adicionar `Co-Authored-By`** do Claude (ou de qualquer assistente de IA) nos commits, nem linhas de atribuição de IA nos pull requests.
3. **NUNCA fazer commit ou push sem autorização explícita de um humano.** Faça as mudanças na árvore de trabalho e aguarde a aprovação antes de rodar `git commit` ou `git push`.
4. **Nunca fugir do escopo do repositório.** Não altere nada fora dele e não faça trabalho além do que foi pedido.
5. **Design tokens: só use tokens.** Toda cor, fonte, raio e sombra vem de `src/styles/tokens.css` (bloco `@theme` do Tailwind).
   - **Proibido:** valores arbitrários do Tailwind (`w-[137px]`, `bg-[#fff]`, `[&>svg]:size-4`, `data-[state=open]:...`) e cores hexadecimais soltas no código.
   - **Se faltar um valor:** crie o token em `tokens.css` e use a classe gerada a partir dele.
   - Essa regra é verificada automaticamente pelo ESLint (`pnpm lint`) e o CI falha se for violada.
6. **O submodule `backend/` é somente leitura.** Ele aponta para o repositório do back-end (`ViajaJunto/viaja-junto.server`). Não edite arquivos dentro dele neste repositório.
