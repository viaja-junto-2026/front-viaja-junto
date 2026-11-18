# Contexto do projeto: ViajaJunto

Resumo do produto e do repositório para quem chega no projeto, seja pessoa ou assistente de IA. Para detalhes, veja os documentos linkados no fim.

## O que é

O **ViajaJunto** é uma aplicação web de **planejamento colaborativo de viagens**. Um grupo monta junto o roteiro (vários destinos e atividades), controla o orçamento, divide as despesas e descobre lugares bem avaliados por outras pessoas, tudo em um só ambiente.

Este repositório é o **front-end** (React + Vite + TypeScript). O back-end (T2) é outro repositório, incluído aqui como submodule em `backend/` e consumido pela API.

**Público:** estudantes e jovens adultos que planejam viagens em grupo, no celular e no computador. A interface é **web responsiva** e em **português do Brasil**.

## Funcionalidades principais

- **Viagens:** criar, editar e excluir viagens (nome, descrição e datas), com status Planejando, Confirmada ou Concluída, e um painel pessoal com todas as viagens do usuário.
- **Destinos:** adicionar vários destinos a uma viagem, em uma ordem de visita, escolhidos de um catálogo (foto, nome, localização, descrição e categoria).
- **Atividades:** adicionar atividades em cada destino (data, duração estimada, custo esperado e status), listadas em ordem cronológica.
- **Orçamento:** definir o orçamento total e ver o resumo (total, planejado, saldo restante e consumo por categoria).
- **Colaboração:** convidar pessoas com um código da viagem, com permissões de Editor ou Viewer, e notificações dentro do app.
- **Avaliações e descoberta:** notas de 1 a 5 com comentário, páginas públicas de destinos e atividades com nota média e fotos, busca no catálogo com filtros e os destinos mais bem avaliados na home.
- **Extras:** despesas divididas entre o grupo (valores em centavos) e mapa de países visitados.

A lista das telas está em [SCOPE.md](SCOPE.md).

## Regras de negócio importantes

- **Visitante sem login** pode navegar pelos catálogos de destinos e atividades, mas não cria viagens nem avalia.
- **Acesso à viagem:** só o criador (OWNER) e os colaboradores podem ver uma viagem.
- **Permissões:** Editor adiciona, edita e remove destinos, atividades e orçamento; Viewer só lê. Apenas o criador convida, muda permissões e remove colaboradores.
- **Avaliações:** só quem tem conta avalia, e um destino só pode ser avaliado por quem **concluiu uma viagem** com ele. A API responde 403 se a viagem não foi concluída e 409 se a pessoa já avaliou.
- Destinos e atividades são **catálogos separados**: um destino é uma cidade, e as atividades são lugares dentro dela. Os itens de uma viagem apenas **referenciam** o catálogo e guardam o que é específico da viagem (datas, custo, status).

## Autenticação

O login é **somente com Google**; o sistema não guarda senhas. Depois do login, a API devolve um token **JWT**, que o front envia no cabeçalho `Authorization: Bearer <token>`. O fluxo completo e a configuração do Google Cloud estão em [SCOPE.md](SCOPE.md).

## Como as peças se encaixam

```
Navegador ──► Front (este repo: React, nginx no Docker, porta 5173)
                 │  openapi-fetch (tipos gerados do contrato OpenAPI)
                 ▼
              API (backend/: NestJS + Prisma, porta 3000, rotas em /api)
                 ├─► PostgreSQL
                 └─► S3 emulado (MiniStack), para fotos
```

- `docker compose up --build` sobe tudo, com dados de demonstração (um usuário, 64 destinos, 930 atividades e uma viagem agendada).
- O contrato da API fica em `src/services/openapi.json`, e os tipos são gerados com `pnpm api:generate`.
- A documentação interativa da API fica em http://localhost:3000/docs.

## Requisitos do trabalho (professor)

- Componentes de UI reutilizáveis, com hooks, em React + Vite + TypeScript.
- As funcionalidades principais precisam funcionar **de ponta a ponta**, com o back-end real. **Nada mockado** na aplicação; mocks são permitidos apenas nos testes.
- As telas tratam **erro, carregamento e estado vazio**.
- Design tokens centralizados e camada de API isolada em `src/services/`, de preferência gerada do OpenAPI.
- URLs vindas de variáveis de ambiente (`.env.example`) e `docker compose up` subindo front e back juntos.
- Testes com Vitest (cobertura mínima de 70%), lint, formatação e CI (lint, testes e build a cada push ou PR).
- Bibliotecas de apoio justificadas na documentação. Correções no back-end, se houver, registradas em `docs/backend-changes.md`.

## Glossário

| Termo                                | Significado                                                          |
| ------------------------------------ | -------------------------------------------------------------------- |
| Viagem (trip)                        | O plano de uma viagem em grupo, com datas, status e membros          |
| Destino do catálogo                  | Uma cidade cadastrada, pública, com nota média                       |
| Destino da viagem (trip destination) | Uma parada da viagem, que aponta para um destino do catálogo         |
| Atividade do catálogo                | Um lugar (passeio, restaurante, hotel) dentro de um destino          |
| Atividade da viagem (trip activity)  | Uma atividade planejada em uma parada, com data e custo              |
| OWNER, EDITOR, VIEWER                | Papéis de uma pessoa em uma viagem: criador, quem edita e quem só lê |
| Código de convite                    | Código da viagem usado para entrar nela                              |

## Documentos

| Documento                              | Conteúdo                                               |
| -------------------------------------- | ------------------------------------------------------ |
| [RULES.md](RULES.md)                   | Regras do projeto (idioma, commits, escopo, tokens)    |
| [SCOPE.md](SCOPE.md)                   | Telas obrigatórias e fluxo de login                    |
| [DESIGN.md](DESIGN.md)                 | Design system: cores, tipografia, layout e componentes |
| [ARCHITECTURE.md](ARCHITECTURE.md)     | Arquitetura, bibliotecas e decisões                    |
| [`../README.md`](../README.md)         | Como instalar e rodar                                  |
| [`../backend/docs/`](../backend/docs/) | Requisitos e arquitetura do back-end                   |
