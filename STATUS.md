# STATUS.md — SENA CRM Imobiliário 2026

**Última atualização:** 16/08/2026  
**Fase atual:** Etapa 1 concluída — autenticação, tenant, usuários e permissões  
**Estado geral:** ETAPAS 0 E 1 CONCLUÍDAS E VALIDADAS / ETAPA 2 (CLIENTES, LEADS E FUNIL) PENDENTE

---

## 1. Handoff da rodada

```text
ETAPA\RODADA: Etapa 1 / rodada 2 (Claude)
ESTADO: CONCLUÍDO E VALIDADO
ALTERADO: prisma (User, Team, BrokerProfile, RefreshSession, PasswordResetToken, AuditLog, Tenant.status;
          migration 20260816190000_auth_tenant_users; seed de admin por variável segura);
          apps/api (auth: login/logout/refresh/me/recuperação de senha, Argon2id, cookies HttpOnly,
          CSRF double-submit, rate limit, guards globais JWT+CSRF+Roles, helmet, users module escopado
          por tenant, AuditService);
          packages/shared (SessionUser, contratos de auth, papéis + roleAtLeast);
          apps/web (AuthProvider, LoginPage, ProtectedRoute, apiClient com CSRF/refresh, sidebar por
          permissão com logout real, alias de build para @sena/shared).
VALIDADO: format:check OK; lint 0 erros (139 warnings pré-existentes do protótipo); typecheck 3/3;
          jest 34 testes / 6 suítes; build shared+api+web OK; migrate deploy + seed OK.
          API real: rota protegida sem sessão 401; senha errada 401; login 200 com 3 cookies;
          /auth/me 200; POST sem header CSRF 403; BROKER em /users 403; ADMIN em /users 200;
          criação de usuário 201; refresh rotativo 200; desativação derruba a sessão aberta (401);
          login de inativo 401; logout 200 e acesso seguinte 401; rate limit responde 429;
          tenant A lendo/alterando usuário do tenant B recebe 404 e não vê o registro na listagem.
          UI real: /dashboard sem sessão redireciona para /login; senha errada mostra erro; login entra
          no painel com access/refresh HttpOnly (só o cookie CSRF é visível ao JS); menu do BROKER
          esconde repasses, comissões, ranking, usuários e configurações; botão Sair encerra a sessão.
PENDÊNCIAS: sem envio de e-mail — o token de recuperação é devolvido pela API apenas fora de produção;
            Node local 20.20.0 (política >=22.12); MySQL de dev na 3306 via docker-compose.
PRÓXIMA AÇÃO EXATA: executar o PROMPT E2 (clientes, corretores, leads, origens e funil).
```

---

## 2. Decisões confirmadas

| Decisão                                     | Estado                              |
| ------------------------------------------- | ----------------------------------- |
| Protótipo aprovado como base visual oficial | CONFIRMADO                          |
| Backend próprio Node.js + NestJS 11         | IMPLEMENTADO                        |
| Prisma 7 + MySQL 8                          | IMPLEMENTADO                        |
| React 19 + Vite no frontend                 | IMPLEMENTADO                        |
| TypeScript front e back                     | IMPLEMENTADO                        |
| Monorepo npm workspaces                     | IMPLEMENTADO                        |
| Multi-tenant desde a fundação               | IMPLEMENTADO (tenant vem da sessão) |
| InsulaCRM apenas como referência            | CONFIRMADO                          |
| Codex e Claude em turnos alternados         | CONFIRMADO                          |

---

## 3. Estrutura atual

```text
sena-crm/
├── apps/
│   ├── api/     NestJS 11 + Prisma 7
│   │            src/{auth,users,audit,health,common,config,database}
│   └── web/     protótipo React 19 + React Router + AuthProvider + api client
├── packages/shared/   contratos de API, sessão, papéis
├── docker-compose.yml MySQL 8.4 de desenvolvimento
├── .env.example / .nvmrc / eslint.config.js / .prettierrc.json
```

Scripts na raiz: `dev`, `dev:web`, `dev:api`, `build`, `typecheck`, `lint`, `format`, `format:check`, `test`,
`prisma:generate`, `prisma:migrate`, `prisma:seed`.

---

## 4. Etapa 1 — o que ficou pronto

### Entidades

`Tenant` (com `status`, timezone e locale), `User`, `BrokerProfile`, `Team`, `RefreshSession`,
`PasswordResetToken` e `AuditLog`. Migration `20260816190000_auth_tenant_users`.

### Autenticação e sessão

- login por e-mail/senha com Argon2id (`@node-rs/argon2`) e política mínima de senha;
- mensagem única para senha errada, e-mail inexistente, usuário inativo e tenant suspenso;
- access token JWT curto (15 min) e refresh rotativo revogável — só o hash do refresh é persistido;
- cookies `HttpOnly` (`Secure` em produção, `SameSite=Lax`); o token nunca fica acessível ao JavaScript;
- CSRF double-submit: cookie legível `sena_csrf` + header `x-csrf-token` em toda operação mutável;
- rate limit em login e recuperação de senha (`@nestjs/throttler`);
- recuperação de senha com token de uso único, expiração de 30 min e revogação de todas as sessões;
- `/auth/me` devolve o usuário da sessão; `/auth/logout` revoga a sessão e limpa cookies;
- helmet e CORS fechados por ambiente.

### Autorização e isolamento

- `JwtAuthGuard` global: nenhuma rota responde sem sessão, exceto as marcadas com `@Public()`
  (`/health`, `/ready`, login, refresh e recuperação de senha);
- `RolesGuard` + `@Roles(...)` para ADMIN / MANAGER / BROKER;
- `tenantId` vem sempre do contexto autenticado — nunca do body, query ou header;
- acesso a registro de outro tenant responde `404`, não `403` (evita enumeração de IDs);
- desativar um usuário revoga imediatamente as sessões abertas dele.

### Usuários

`GET /users` e `GET /users/:id` (ADMIN/MANAGER), `POST /users` e `PATCH /users/:id/status` (ADMIN),
todos escopados pelo tenant da sessão. Seed de administrador apenas por `SEED_ADMIN_EMAIL`/
`SEED_ADMIN_PASSWORD` e nunca em produção.

### Auditoria

`AuditLog` grava login com sucesso, login recusado, login bloqueado, logout, pedido e conclusão de
recuperação de senha, criação de usuário e ativação/desativação. Nunca registra senha, token ou hash;
falha de auditoria não derruba a operação principal.

### Frontend

- `LoginPage` no visual SENA (mesma paleta slate/amber), com erro inline e estado de carregamento;
- `AuthProvider` guarda **apenas** a sessão; dados de domínio seguem nos hooks de cada feature;
- `ProtectedRoute`: sem sessão, qualquer rota do painel redireciona para `/login` guardando o destino;
- `apiClient` envia o header CSRF e tenta um refresh automático (uma vez) quando recebe 401;
- sidebar esconde itens sem permissão e mostra usuário, papel e imobiliária reais, com botão Sair.

---

## 5. Decisões técnicas desta rodada

1. **Argon2id via `@node-rs/argon2`**: binários pré-compilados, sem toolchain nativa no Windows.
2. **Guards globais em vez de decorar cada controller**: o padrão passa a ser rota fechada; abrir exige
   `@Public()` explícito.
3. **`404` para registro de outro tenant** conforme ARCHITECTURE.md §7.3.
4. **Token de recuperação devolvido pela API fora de produção**: não há serviço de e-mail ainda; a
   substituição por envio real fica na etapa de integrações.
5. **`apps/web` consome `packages/shared` pelo código-fonte** (alias no Vite + `paths` no tsconfig): o
   `dist` CJS existe para o Nest, mas seu re-export não é estático o bastante para o Rollup enxergar as
   constantes exportadas.
6. **Menu por papel é conveniência de interface**, não barreira — a autorização real é do backend.

---

## 6. Pendências e bloqueios

| Item                              | Estado                 | Observação                                                                                                                                                             |
| --------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Envio de e-mail                   | PENDENTE               | Recuperação de senha funciona ponta a ponta, mas o token só é entregue pela resposta da API fora de produção.                                                          |
| Node local 20.20.0                | BLOQUEIO DE AMBIENTE   | Política do projeto é >=22.12. Tudo passa com aviso `EBADENGINE`; atualizar antes de deploy/CI.                                                                        |
| MySQL da porta 3307               | PENDENTE DE INFORMAÇÃO | A instância da 3307 recusou `root/root`. A validação usa o container `sena-crm-mysql` (3306) do `docker-compose.yml`; se a 3307 for a oficial, ajustar `DATABASE_URL`. |
| CI (Node 22 e 24)                 | PENDENTE               | Não faz parte das etapas 0 e 1.                                                                                                                                        |
| Teams sem endpoints               | PARCIAL                | Entidade e relações existem no schema; a gestão de equipes entra quando houver tela para ela.                                                                          |
| Dados desnormalizados no frontend | ESPERADO               | View model do mock; o banco usa relações por ID.                                                                                                                       |

---

## 7. Estado do backend

| Área                                                      | Estado                                   |
| --------------------------------------------------------- | ---------------------------------------- |
| Monorepo / NestJS / Prisma / MySQL / Env / Health         | CONCLUÍDO                                |
| Tenant                                                    | CONCLUÍDO (isolamento pela sessão)       |
| Auth (login, logout, refresh, recuperação de senha)       | CONCLUÍDO                                |
| Users / Roles                                             | CONCLUÍDO (CRUD mínimo + permissões)     |
| Team                                                      | PARCIAL (schema pronto, sem endpoints)   |
| Audit                                                     | CONCLUÍDO (eventos de acesso e usuários) |
| Client, Lead, Property, Visit, Proposal, Sale, Commission | PENDENTE                                 |
| Rentals, Developments/Lots, Reports                       | PENDENTE                                 |
| OCR, CPF/CNPJ, WhatsApp, Payment Split, AI Specialist     | PENDENTE                                 |

---

## 8. Estado por módulo: UI x backend

Todos os módulos visuais do protótipo continuam DISPONÍVEIS em `apps/web` e seguem com backend PENDENTE:
os dados ainda vêm de `src/data/senaCrmData.ts` em `useState`, então alterações somem no reload. O que mudou
nesta etapa é o acesso: o painel inteiro agora exige sessão real.

---

## 9. Como rodar

```bash
docker compose up -d          # MySQL 8.4 em localhost:3306
cp .env.example .env          # definir JWT_SECRET, DATABASE_URL e o admin de seed
npm install
npm run prisma:migrate
npm run prisma:seed           # cria o tenant SENA e o admin de SEED_ADMIN_*
npm run dev                   # web em :3000, API em :3333/api/v1
```

O painel abre em `http://localhost:3000/login`.

---

## 10. Regra para a próxima IA/agente

Use o **PROMPT E2** de `ROADMAP.md`. Leia este `STATUS.md`, a Etapa 2 do `ROADMAP.md` e apenas as seções de
`ARCHITECTURE.md` citadas por aquele prompt. Não reaudite o repositório nem releia a documentação inteira.

Todo módulo novo deve nascer escopado por `tenantId` vindo da sessão e com teste provando o isolamento.
Não altere o design aprovado. Não marque etapa como concluída sem executar a validação correspondente.
