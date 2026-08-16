# STATUS.md — SENA CRM Imobiliário 2026

**Última atualização:** 16/08/2026  
**Fase atual:** Etapa 0 concluída — fundação do monorepo e API executável  
**Estado geral:** ETAPA 0 CONCLUÍDA E VALIDADA / ETAPA 1 (AUTH) PENDENTE

---

## 1. Handoff da rodada

```text
ETAPA\RODADA: Etapa 0 / rodada 1 (Claude)
ESTADO: CONCLUÍDO E VALIDADO
ALTERADO: raiz do monorepo (package.json workspaces, eslint/prettier, .nvmrc, .env.example, docker-compose.yml);
          apps/web (protótipo movido de prototipo/, React Router, api client, recharts, remoção do senaZipExporter);
          apps/api (NestJS 11, config/env Zod, PrismaModule + adapter MariaDB, /health, /ready, filtro de erros,
          envelope {data}, request-id + log estruturado, Swagger em dev, prisma/schema + migration + seed);
          packages/shared (contratos de resposta, health, roles).
VALIDADO: npm install; format:check OK; lint 0 erros (139 warnings pré-existentes do protótipo);
          typecheck 3/3 workspaces; jest 7 testes / 2 suítes OK; build shared+api+web OK;
          migrate deploy em banco vazio + seed OK; GET /api/v1/health 200; GET /api/v1/ready 200 com MySQL de pé
          e 503 com banco fora; 404 responde envelope de erro com requestId; /api/v1/docs 200;
          web em http://localhost:3000/dashboard renderiza a interface aprovada, sem erros de console.
PENDÊNCIAS: Node local é 20.20.0 (política exige >=22.12); MySQL de dev sobe pelo docker-compose na 3306
            (instância da 3307 recusou root/root — credencial desconhecida).
PRÓXIMA AÇÃO EXATA: executar o PROMPT E1 (autenticação, tenant, usuários e permissões).
```

---

## 2. Decisões confirmadas

| Decisão                                     | Estado                          |
| ------------------------------------------- | ------------------------------- |
| Protótipo aprovado como base visual oficial | CONFIRMADO                      |
| Backend próprio Node.js + NestJS 11         | IMPLEMENTADO                    |
| Prisma 7 + MySQL 8                          | IMPLEMENTADO                    |
| React 19 + Vite no frontend                 | IMPLEMENTADO                    |
| TypeScript front e back                     | IMPLEMENTADO                    |
| Monorepo npm workspaces                     | IMPLEMENTADO                    |
| Multi-tenant desde a fundação               | INICIADO (modelo Tenant + seed) |
| InsulaCRM apenas como referência            | CONFIRMADO                      |
| Codex e Claude em turnos alternados         | CONFIRMADO                      |

---

## 3. Estrutura atual

```text
sena-crm/
├── apps/
│   ├── api/     NestJS 11 + Prisma 7 (prisma.config.ts, schema, migrations, seed)
│   └── web/     protótipo React 19 aprovado + React Router + api client
├── packages/shared/   contratos de API, health, roles
├── docker-compose.yml MySQL 8.4 de desenvolvimento
├── .env.example / .nvmrc / eslint.config.js / .prettierrc.json
```

Scripts na raiz: `dev`, `dev:web`, `dev:api`, `build`, `typecheck`, `lint`, `format`, `format:check`, `test`,
`prisma:generate`, `prisma:migrate`, `prisma:seed`.

---

## 4. Etapa 0 — o que ficou pronto

### Backend

- monorepo npm workspaces com `engines.node >=22.12.0` e `.nvmrc`;
- `apps/api` NestJS 11, prefixo global `/api/v1`, CORS pela env;
- validação de `.env` com Zod (`src/config/env.ts`) — a API não sobe com env inválido;
- `PrismaModule`/`PrismaService` com driver adapter MariaDB (exigência do Prisma 7);
- `GET /health` (liveness) e `GET /ready` (checa MySQL, 503 quando o banco está fora);
- filtro global de exceções no formato `{ error: { code, message, fields?, requestId } }`, sem stack trace;
- interceptor que envelopa sucesso em `{ data }`;
- middleware de `x-request-id` + logger estruturado (JSON em produção, legível em dev);
- Swagger em `/api/v1/docs` apenas fora de produção e sob `SWAGGER_ENABLED`;
- lint, format, typecheck e testes configurados.

### Frontend

- protótipo preservado em `apps/web` sem redesenho;
- `recharts` declarado no `package.json` (bloqueio de build resolvido);
- React Router: a tab ativa passa a vir da URL (`src/routes/senaRoutes.ts`), `/` redireciona para `/dashboard`;
  o shell continua montado numa rota única, então o estado mock não se perde ao navegar;
- API client base em `src/services/apiClient.ts` (`VITE_API_URL`, `credentials: "include"` já pronto para a Etapa 1);
- mocks de `senaCrmData.ts` mantidos.

### Banco

- MySQL 8.4 via `docker-compose.yml` (serviço `mysql`, banco `sena_crm`);
- migration inicial `20260816175252_init_tenant` (tabela `tenants`);
- seed do tenant SENA (`slug: sena`), idempotente por upsert.

---

## 5. Decisões técnicas tomadas nesta rodada

1. **Prisma 7 exige `prisma.config.ts`**: a `url` saiu do `schema.prisma` e o cliente passou a receber o
   adapter `@prisma/adapter-mariadb` (caminho oficial do Prisma 7 para MySQL).
2. **`senaZipExporter` removido**: era o exportador do AI Studio, não parte do produto. Os dois botões
   "Baixar Projeto (.ZIP)" (header e sidebar) saíram junto — é a única mudança visível na interface.
3. **API sobe mesmo sem banco**: falha de conexão vira log de erro; `/health` continua respondendo e `/ready`
   acusa `database: down`. Isso mantém liveness e readiness com significados distintos.
4. **`packages/shared` compila em CommonJS** para ser consumível tanto pelo Nest quanto pelo Vite.
5. **Prettier rodou no repositório inteiro** (checkpoint da etapa): reformatação apenas de espaçamento nos
   arquivos do protótipo, sem alteração de marcação ou de classes Tailwind.

---

## 6. Pendências e bloqueios

| Item                              | Estado                 | Observação                                                                                                                                                                              |
| --------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node local 20.20.0                | BLOQUEIO DE AMBIENTE   | Política do projeto é >=22.12. `npm install` funciona com aviso `EBADENGINE`; toda a bateria passou, mas o ambiente deve ser atualizado antes do deploy.                                |
| MySQL da porta 3307               | PENDENTE DE INFORMAÇÃO | A instância informada na 3307 recusou `root/root`. A validação usou o container `sena-crm-mysql` (3306) do `docker-compose.yml`. Se a 3307 for a oficial, basta ajustar `DATABASE_URL`. |
| CI (Node 22 e 24)                 | PENDENTE               | Não faz parte da Etapa 0.                                                                                                                                                               |
| Navegação sem URL real            | RESOLVIDO              | React Router aplicado.                                                                                                                                                                  |
| `recharts` ausente                | RESOLVIDO              | Declarado em `apps/web/package.json`.                                                                                                                                                   |
| Dados desnormalizados no frontend | ESPERADO               | View model do mock; o banco usará relações por ID.                                                                                                                                      |

---

## 7. Estado do backend

| Área                                                      | Estado                                         |
| --------------------------------------------------------- | ---------------------------------------------- |
| Monorepo                                                  | CONCLUÍDO                                      |
| NestJS API                                                | CONCLUÍDO (fundação)                           |
| Prisma                                                    | CONCLUÍDO (fundação)                           |
| MySQL                                                     | CONCLUÍDO (dev)                                |
| Env validation                                            | CONCLUÍDO                                      |
| Health/Ready                                              | CONCLUÍDO                                      |
| Tenant                                                    | PARCIAL (modelo + seed; isolamento na Etapa 1) |
| Auth / Users / Roles / Audit                              | PENDENTE                                       |
| Client, Lead, Property, Visit, Proposal, Sale, Commission | PENDENTE                                       |
| Rentals, Developments/Lots, Reports                       | PENDENTE                                       |
| OCR, CPF/CNPJ, WhatsApp, Payment Split, AI Specialist     | PENDENTE                                       |

---

## 8. Estado por módulo: UI x backend

Todos os módulos visuais do protótipo continuam DISPONÍVEIS em `apps/web` (dashboard, leads/funil,
clientes/matching, imóveis, visitas, propostas, vendas, comissões, locações, vistorias, repasses, manutenção,
empreendimentos/lotes, corretores/ranking, relatórios) e todos seguem com backend PENDENTE. Os dados ainda vêm
de `src/data/senaCrmData.ts` em `useState`, portanto alterações somem no reload — comportamento esperado até a
conexão real com a API.

---

## 9. Como rodar

```bash
docker compose up -d          # MySQL 8.4 em localhost:3306
cp .env.example .env          # ajustar DATABASE_URL se necessário
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev                   # web em :3000, API em :3333/api/v1
```

---

## 10. Regra para a próxima IA/agente

Use o **PROMPT E1** de `ROADMAP.md`. Leia este `STATUS.md`, a Etapa 1 do `ROADMAP.md` e as seções 7, 8, 9 e 30 do
`ARCHITECTURE.md`. Não reaudite o repositório nem releia a documentação inteira.

Não altere o design aprovado. Não marque etapa como concluída sem executar a validação correspondente.
Problemas fora do escopo são registrados aqui, não corrigidos por refactor amplo.
