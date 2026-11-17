# Viaja Junto — Front-end

Front-end do projeto Viaja Junto, feito com **React + Vite + TypeScript**.

## Requisitos

- Node.js 22+
- [pnpm](https://pnpm.io) 11 (`corepack enable` já resolve a versão pelo `packageManager`)

## Como rodar com Docker (front + back)

O back-end vem do submodule `backend/` ([ViajaJunto/viaja-junto.server](https://github.com/ViajaJunto/viaja-junto.server)). Clone com os submodules:

```bash
git clone --recurse-submodules https://github.com/viaja-junto-2026/front-viaja-junto.git
# se já clonou sem eles: git submodule update --init
docker compose up --build
```

Sobe PostgreSQL, migrations, API, dados de demonstração e o front. Não precisa configurar nada.

| Serviço | URL                        |
| ------- | -------------------------- |
| Front   | http://localhost:5173      |
| API     | http://localhost:3000/api  |
| Swagger | http://localhost:3000/docs |

Para usar o login real do Google, copie `.env.example` para `.env` e preencha `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`.

## Como rodar localmente (sem Docker)

```bash
pnpm install
cp .env.example .env   # ajuste VITE_API_URL se necessário
pnpm dev
```

## Scripts

| Comando              | O que faz                         |
| -------------------- | --------------------------------- |
| `pnpm dev`           | Servidor de desenvolvimento       |
| `pnpm build`         | Checagem de tipos + build         |
| `pnpm lint`          | ESLint                            |
| `pnpm format`        | Formata com Prettier              |
| `pnpm format:check`  | Verifica formatação (usado no CI) |
| `pnpm test`          | Testes com Vitest                 |
| `pnpm test:coverage` | Testes com cobertura              |

O CI (`.github/workflows/ci.yml`) roda audit, lint, formatação, tipos, testes com cobertura e build a cada push ou PR.

## Estrutura

```
src/
  components/   componentes de UI reutilizáveis
  hooks/        hooks customizados
  pages/        telas
  services/     camada de acesso à API (isolada do resto do app)
  config/       configuração (env)
  styles/       design tokens (tokens.css)
  types/        tipos compartilhados
docs/           documentação (justificativas, mudanças no back-end)
```
