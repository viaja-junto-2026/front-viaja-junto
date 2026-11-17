# Viaja Junto — Front-end

Front-end do projeto Viaja Junto, feito com **React + Vite + TypeScript**.

## Requisitos

- Node.js 22+
- [pnpm](https://pnpm.io) 11 (`corepack enable` já resolve a versão pelo `packageManager`)

## Como rodar

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
