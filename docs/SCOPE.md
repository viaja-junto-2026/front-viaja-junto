# Escopo do front-end

Telas que o front precisa entregar, derivadas dos requisitos do back-end (`backend/docs/requirements.md`) e das rotas do contrato OpenAPI. As obrigatórias cobrem os requisitos de prioridade alta.

> Atualizar este documento se o escopo mudar. Dúvida em aberto: confirmar com o professor quais são as "funcionalidades principais".

## Telas obrigatórias

| #   | Tela                                                                                          | Requisitos          | Rotas principais                                                               |
| --- | --------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------ |
| 1   | **Login** com Google                                                                          | FR01, FR02          | `GET /auth/google`                                                             |
| 2   | **Retorno do login** (`/auth/callback`)                                                       | FR01, FR02          | Lê o token da URL e chama `GET /auth/me`                                       |
| 3   | **Home pública**, com os destinos mais bem avaliados                                          | BR01, FR25          | `GET /destination-catalog/top`                                                 |
| 4   | **Catálogo de destinos**, com busca e filtros, e **página do destino**                        | FR10, FR24, FR23    | `GET /destination-catalog`, `GET /destination-catalog/{id}/details`            |
| 5   | **Página pública da atividade**, com nota média e avaliações                                  | FR23                | `GET /activity-catalog`, `GET /activity-catalog/{id}/details`                  |
| 6   | **Minhas viagens** (dashboard)                                                                | FR06                | `GET /trips`                                                                   |
| 7   | **Criar e editar viagem**, com status e exclusão                                              | FR04, FR05, FR07    | `POST/PATCH/DELETE /trips`                                                     |
| 8   | **Roteiro da viagem**: destinos em ordem, atividades por destino em ordem cronológica         | FR08, FR09, FR12–14 | `/trip-destinations`, `/trip-activities`, `PUT /trips/{id}/destinations/order` |
| 9   | **Orçamento**: definir o total e ver o resumo (total, planejado, restante, por categoria)     | FR15–17             | `/budgets`, `GET /trips/{id}/budget/summary`                                   |
| 10  | **Colaboração**: código de convite, entrar por código, membros, trocar Editor/Viewer, remover | FR18–20, BR04       | `POST /trips/join`, `/trips/{id}/invite-code`, `/trip-members`                 |
| 11  | **Avaliar** destino ou atividade (nota de 1 a 5 e comentário)                                 | FR22, BR05          | `POST /destination-reviews`, `POST /reviews`                                   |

## Telas extras (prioridade média ou baixa)

- **Notificações** (FR21): `/notifications` e contador de não lidas.
- **Mapa de países visitados** (FR11): `GET /users/me/visited-countries`.
- **Despesas compartilhadas**: `/trip-expenses`.
- **Perfil do usuário**: `PATCH /users/{id}`.
- **Buscar atividades de um destino** (Google Places): `GET /destination-catalog/{id}/activities`.

## Vale para todas as telas

- Tratar **carregamento, erro e estado vazio**.
- Rotas privadas redirecionam para o login quando a API responde 401.
- Esconder as ações de edição para quem tem permissão Viewer (BR03).
- Layout responsivo, em desktop e celular (NFR01).
- Avaliações: tratar 403 (não concluiu a viagem) e 409 (já avaliou).

## Login com Google

Decisão: usar o login real com Google, como o back-end propõe (não há senha).

### Como o fluxo funciona

1. A tela de login tem um botão que navega para `{VITE_API_URL}/api/auth/google`. Precisa ser uma navegação de página inteira (`window.location`), nunca `fetch`: o redirecionamento para o Google é bloqueado por CORS em chamadas de script.
2. Depois do consentimento, a API redireciona para `AUTH_REDIRECT_URL` (`http://localhost:5173/auth/callback`) com o token no fragmento: `#access_token=<jwt>&token_type=Bearer&expires_in=<segundos>`.
3. A tela `/auth/callback` lê o token, guarda, limpa o fragmento da URL e redireciona.
4. As demais chamadas enviam `Authorization: Bearer <token>`.
5. O logout chama `POST /api/auth/logout`, que invalida os tokens do usuário em todos os dispositivos, e descarta o token no cliente.

### Configuração necessária (fora do código)

1. No [Google Cloud Console](https://console.cloud.google.com/), em **APIs e serviços > Credenciais**, criar um **ID do cliente OAuth** do tipo _Aplicativo da Web_.
2. Em **URIs de redirecionamento autorizados**, cadastrar `http://localhost:3000/api/auth/google/callback`.
3. Se o app estiver em modo de teste na tela de consentimento, adicionar como **usuários de teste** os e-mails de quem vai entrar.
4. Copiar o ID e o segredo do cliente para o `.env` da raiz (`GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`). O `docker compose up` lê esse arquivo automaticamente.

O segredo do cliente nunca vai para o repositório (o `.env` está no `.gitignore`).

Sem essas credenciais o compose sobe com valores de demonstração e o login do Google falha. Nesse caso, só dá para testar com o token de demonstração que o seed imprime nos logs do container `viajajunto-seed`.
