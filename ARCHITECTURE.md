# ARCHITECTURE.md — SENA CRM Imobiliário 2026

**Status:** arquitetura inicial aprovada para implementação  
**Data-base:** 16/08/2026  
**Objetivo:** transformar o protótipo React aprovado pelo cliente em um CRM imobiliário real, persistente e seguro, com backend próprio em Node.js/NestJS e banco MySQL.

---

## 1. Decisão arquitetural

O SENA CRM **não usará o InsulaCRM como runtime/backend**. O InsulaCRM poderá ser consultado apenas como referência de implementação para recursos como isolamento por tenant, pipeline, visitas, matching, auditoria, notificações e IA.

A aplicação oficial será formada por:

```text
SENA CRM
│
├── Frontend
│   ├── React 19
│   ├── TypeScript
│   ├── Vite
│   ├── Tailwind CSS
│   └── Interface derivada diretamente do protótipo aprovado
│
├── Backend
│   ├── Node.js
│   ├── NestJS
│   ├── TypeScript
│   ├── REST API versionada
│   └── OpenAPI/Swagger
│
├── Persistência
│   ├── Prisma ORM
│   └── MySQL 8
│
└── Integrações
    ├── WhatsApp
    ├── OCR
    ├── Consulta CPF/CNPJ
    ├── Gateway / split de pagamentos
    ├── E-mail
    └── IA
```

### 1.1 Princípio central

O frontend aprovado pelo cliente é a **fonte de verdade visual**.

O backend é a **fonte de verdade dos dados e das regras de negócio**.

Nenhuma regra crítica de negócio deve existir apenas no React.

Exemplo: ao aprovar uma proposta, hoje o protótipo altera proposta, cria venda, altera imóvel e gera comissão em `useState`. No produto real, toda essa operação deve ocorrer no backend dentro de uma transação de banco.

---

## 2. Compatibilidade Node.js

### 2.1 Alvo suportado

- Node.js mínimo: **22.12.0**
- Node.js recomendado para novos ambientes: **LTS suportado pela stack**
- CI deverá validar pelo menos Node 22 e Node 24 enquanto ambos forem suportados.
- Não desenvolver assumindo Node 20.
- `package.json` raiz deverá declarar `engines.node`.
- O repositório deverá conter `.nvmrc` ou equivalente.

### 2.2 Backend

- NestJS 11.x
- Prisma ORM 7.x
- TypeScript estrito
- API ESM-compatible
- MySQL 8.x

### 2.3 Frontend existente

O protótipo recebido usa:

- React 19
- Vite 6.2
- Tailwind CSS 4.1
- TypeScript 5.8
- lucide-react

Não atualizar dependências visuais durante a fundação sem necessidade. Primeiro fazer o protótipo compilar e preservar aparência/comportamento.

---

## 3. Estrutura do repositório

Usar monorepo simples com **npm workspaces**, sem Nx/Turborepo inicialmente.

```text
sena-crm/
│
├── apps/
│   ├── web/                       # React + Vite: protótipo aprovado evoluído
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── hooks/
│   │   │   └── styles/
│   │   └── package.json
│   │
│   └── api/                       # NestJS
│       ├── src/
│       │   ├── common/
│       │   ├── config/
│       │   ├── database/
│       │   ├── auth/
│       │   ├── tenants/
│       │   ├── users/
│       │   ├── teams/
│       │   ├── clients/
│       │   ├── leads/
│       │   ├── properties/
│       │   ├── visits/
│       │   ├── proposals/
│       │   ├── sales/
│       │   ├── commissions/
│       │   ├── rentals/
│       │   ├── developments/
│       │   ├── reports/
│       │   ├── notifications/
│       │   ├── integrations/
│       │   ├── ai/
│       │   ├── audit/
│       │   └── health/
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── migrations/
│       │   └── seed.ts
│       └── package.json
│
├── packages/
│   └── shared/                    # contratos compartilhados, enums, schemas Zod
│       ├── src/
│       │   ├── api/
│       │   ├── enums/
│       │   ├── schemas/
│       │   └── types/
│       └── package.json
│
├── docs/
├── .env.example
├── .nvmrc
├── package.json
├── ARCHITECTURE.md
├── ROADMAP.md
└── STATUS.md
```

### 3.1 Regra de dependência

```text
apps/web  ───────► packages/shared
apps/api  ───────► packages/shared

packages/shared NÃO depende de apps/web nem apps/api.
```

O pacote `shared` não deve conter código Prisma, NestJS ou React. Ele deve conter apenas contratos realmente compartilháveis.

---

## 4. Organização do frontend

O protótipo atual possui módulos grandes dentro de `src/components/senaCrm`. Eles serão preservados visualmente e gradualmente reorganizados por feature.

Exemplo:

```text
features/
├── dashboard/
├── leads/
├── clients/
├── properties/
├── visits/
├── proposals/
├── sales/
├── commissions/
├── rentals/
├── developments/
├── brokers/
└── reports/
```

### 4.1 Estado do servidor

Substituir gradualmente `useState(INITIAL_...)` por chamadas reais.

Padrão desejado:

```text
Tela React
   ↓
feature hook
   ↓
TanStack Query
   ↓
API client
   ↓
/api/v1/...
```

Dados recebidos do backend não devem ser duplicados em stores globais sem necessidade.

### 4.2 Rotas reais

Substituir navegação por `currentTab` por React Router.

Rotas base:

```text
/login
/dashboard
/leads
/leads/funil
/clientes
/clientes/:id
/imoveis
/imoveis/:id
/visitas
/propostas
/propostas/:id
/vendas
/vendas/:id
/comissoes
/locacoes
/locacoes/contratos
/locacoes/repasses
/locacoes/vistorias
/locacoes/manutencoes
/empreendimentos
/empreendimentos/:id
/empreendimentos/:id/espelho
/corretores
/corretores/:id
/relatorios
/configuracoes
```

### 4.3 Tipos existentes do protótipo

`src/types/senaCrm.ts` é referência funcional, **não esquema definitivo de banco**.

Exemplos de divergência esperada:

- `ownerName` será relação com `Client`/`PropertyOwner`.
- `brokerName` será relação por ID.
- `clientName` será relação por ID.
- métricas de corretor serão calculadas, não campos editáveis permanentes.
- comissão será normalizada em `Commission` + `CommissionSplit`.
- loteamentos terão tabelas próprias.

---

## 5. API

### 5.1 Convenções

Prefixo obrigatório:

```text
/api/v1
```

Exemplos:

```text
GET    /api/v1/clients
POST   /api/v1/clients
GET    /api/v1/clients/:id
PATCH  /api/v1/clients/:id

GET    /api/v1/leads
POST   /api/v1/leads
PATCH  /api/v1/leads/:id/status

GET    /api/v1/properties
POST   /api/v1/properties
GET    /api/v1/properties/:id
PATCH  /api/v1/properties/:id

POST   /api/v1/proposals/:id/approve
POST   /api/v1/proposals/:id/counter-offer
```

### 5.2 Resposta padrão

Objeto simples:

```json
{
  "data": {}
}
```

Lista paginada:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 150,
    "totalPages": 6
  }
}
```

Erro:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos.",
    "fields": {}
  }
}
```

Nunca retornar stack trace em produção.

### 5.3 Validação

- schemas Zod compartilhados para contratos HTTP quando fizer sentido;
- backend sempre revalida a entrada;
- frontend nunca é considerado barreira de segurança;
- IDs, `tenantId`, valores financeiros e status nunca são confiados diretamente a partir do browser.

### 5.4 OpenAPI

NestJS deverá expor documentação Swagger/OpenAPI somente em ambiente autorizado.

Contrato de API deverá ser mantido sincronizado com os DTOs/schemas.

---

## 6. Banco de dados

### 6.1 Banco

- MySQL 8
- Prisma ORM
- timezone da aplicação: UTC no banco/backend
- apresentação: `America/Sao_Paulo`
- moeda principal: BRL

### 6.2 IDs

Usar IDs internos não sequenciais do Prisma (`cuid()` ou estratégia definida na fundação).

Códigos humanos ficam separados:

```text
SENA-801
PROP-2026-050
VENDA-2026-020
LOC-2026-001
```

Nunca usar código humano como chave primária.

### 6.3 Dinheiro

Não usar `float` para dinheiro.

Padrão:

```text
Decimal(15,2)
```

Percentuais devem usar Decimal com precisão suficiente.

### 6.4 Soft delete

Entidades de negócio relevantes devem usar exclusão lógica quando histórico for importante.

Nunca apagar fisicamente vendas, contratos, pagamentos, comissões ou logs por uma ação comum do usuário.

---

## 7. Multi-tenant

Mesmo que o primeiro cliente seja apenas SENA, a fundação será multi-tenant.

### 7.1 Regra

Toda entidade de negócio pertencente à imobiliária terá `tenantId`.

Exemplos:

```text
Client
Lead
Property
Visit
Proposal
Sale
Commission
Lease
Development
Lot
User
Team
AuditLog
```

### 7.2 Isolamento

Nenhum controller deverá aceitar `tenantId` do body para determinar propriedade do registro.

O tenant será obtido da sessão/autenticação.

Padrão:

```ts
const tenantId = authContext.tenantId;
```

Todas as queries de negócio deverão incluir o escopo do tenant.

### 7.3 Teste obrigatório

Para cada módulo de dados sensíveis deve existir ao menos um teste provando que usuário do tenant A não consegue:

1. listar registro do tenant B;
2. ler registro do tenant B;
3. alterar registro do tenant B;
4. excluir/acionar operação no registro do tenant B.

Resposta preferida: `404` para evitar enumeração de IDs.

---

## 8. Autenticação e segurança

### 8.1 Perfis

Perfis funcionais iniciais:

```text
ADMIN
MANAGER
BROKER
```

Pode existir internamente `PLATFORM_ADMIN`, sem exposição ao usuário comum.

### 8.2 Senhas

- Argon2id
- política mínima de senha
- reset com token de uso único e expiração
- não armazenar senha ou token em texto puro

### 8.3 Sessão web

Preferência para SPA same-origin:

- cookie HttpOnly;
- `Secure` em produção;
- `SameSite=Lax` ou mais restritivo quando aplicável;
- access token curto;
- refresh token rotativo e revogável;
- hash do refresh token persistido;
- proteção CSRF para operações mutáveis baseadas em cookie.

Não guardar token de autenticação permanente em `localStorage`.

### 8.4 Proteções mínimas

- Helmet/security headers;
- CORS fechado por ambiente;
- rate limiting em login, recuperação e integrações públicas;
- limites de tamanho de payload/upload;
- MIME real e extensão validada;
- logs sem segredos;
- segredos exclusivamente via env/secret store;
- auditoria de ações críticas.

---

## 9. Modelo de domínio — núcleo

### 9.1 Tenant

```text
Tenant
- id
- name
- slug
- document?
- timezone
- locale
- status
- createdAt
- updatedAt
```

### 9.2 User / Broker

`User` representa acesso ao sistema.

Dados profissionais do corretor ficam em `BrokerProfile`.

```text
User
- id
- tenantId
- name
- email
- passwordHash
- role
- status

BrokerProfile
- userId
- creci
- phone
- whatsapp
- teamId?
- managerUserId?
- avatarAssetId?
```

Métricas como VGV, vendas e conversão são derivadas das transações.

### 9.3 Team

```text
Team
- id
- tenantId
- name
- managerUserId
- status
```

---

## 10. Cliente unificado

Não criar entidades independentes para comprador, proprietário, locador e locatário.

Uma pessoa/empresa é `Client` e pode ter múltiplos papéis.

```text
Client
│
├── ClientRoleAssignment
│   ├── BUYER
│   ├── OWNER
│   ├── LESSOR
│   ├── TENANT
│   └── INVESTOR
│
├── InterestProfile
├── Leads
├── PropertiesOwned
├── Visits
├── Proposals
├── Sales
└── Leases
```

Campos principais:

```text
Client
- id
- tenantId
- type: PERSON | COMPANY
- name
- documentType: CPF | CNPJ
- documentEncrypted
- documentHash
- documentLast4
- phone
- whatsapp
- email
- responsibleBrokerId?
- lastContactAt?
- nextContactAt?
- notes?
- createdAt
- updatedAt
```

### 10.1 CPF/CNPJ

Não armazenar retorno bruto de provedores sem necessidade.

Para permitir busca segura por documento:

- armazenar documento normalizado de forma criptografada;
- armazenar hash/HMAC determinístico para comparação exata;
- armazenar somente últimos dígitos para exibição auxiliar;
- registrar auditoria de consultas externas.

---

## 11. Leads, origem e campanhas

```text
Lead
- id
- tenantId
- clientId
- assignedBrokerId
- originId
- campaignId?
- status
- lostReason?
- estimatedBudget?
- lastContactAt?
- nextContactAt?
- notes?
- createdAt
```

Status inicial SENA:

```text
NEW
CONTACT
QUALIFIED
PROPERTY_PRESENTED
VISIT
PROPOSAL
NEGOTIATION
CLOSED
LOST
```

Origem será configurável por tenant.

Dados iniciais poderão incluir:

- Placa no Imóvel
- Outdoor
- Instagram Ads
- WhatsApp Direto
- Facebook Ads
- Google Ads
- Indicação
- Plantão de Vendas
- Evento de Lançamento
- Corretor Parceiro
- Prospecção Ativa
- Portal Imobiliário
- Outros

`LOST` exige motivo.

---

## 12. Perfil de interesse e matching

```text
InterestProfile
- id
- tenantId
- clientId
- objective: BUY | RENT
- minPrice
- maxPrice
- minBedrooms
- minSuites?
- minParkingSpots?
- paymentMethod
- needsFinancing
- notes?
```

Relações auxiliares para tipos de imóvel e regiões/bairros preferidos.

O matching deve produzir resultado calculado, por exemplo:

```text
score: 92
reasons:
- preço compatível
- bairro desejado
- quartos compatíveis
- aceita financiamento
```

Não persistir o score como verdade permanente sem necessidade. Recalcular ou cachear com versão dos critérios.

---

## 13. Imóveis

```text
Property
- id
- tenantId
- code
- title
- type
- purpose: SALE | RENT | BOTH
- captatorBrokerId?
- salePrice?
- rentalPrice?
- condoFee?
- iptu?
- addressLine
- number?
- complement?
- neighborhood
- city
- state
- zipCode
- latitude?
- longitude?
- totalArea?
- privateArea?
- bedrooms?
- suites?
- bathrooms?
- parkingSpots?
- documentationStatus
- isExclusive
- exclusivityEndsAt?
- status
- description?
- createdAt
- updatedAt
```

### 13.1 Proprietários

Suportar mais de um proprietário:

```text
PropertyOwner
- tenantId
- propertyId
- clientId
- ownershipPercentage?
- isPrimary
```

### 13.2 Fotos e documentos

```text
Asset
- id
- tenantId
- kind
- storageProvider
- path
- mimeType
- size
- checksum
- createdBy

PropertyMedia
- propertyId
- assetId
- type
- sortOrder
```

Não salvar binários grandes no MySQL.

### 13.3 Status

```text
CAPTURING
AVAILABLE
RESERVED
NEGOTIATION
SOLD
RENTED
SUSPENDED
```

---

## 14. Visitas

```text
Visit
- id
- tenantId
- clientId
- propertyId
- brokerId
- scheduledAt
- durationMinutes?
- status
- feedback?
- impression?
- createdAt
```

Status:

```text
SCHEDULED
COMPLETED
CANCELLED
NO_SHOW
```

---

## 15. Propostas, negociação e venda

### 15.1 Proposal

```text
Proposal
- id
- tenantId
- code
- clientId
- propertyId
- brokerId
- advertisedPrice
- proposedPrice
- downPayment
- installmentsCount
- installmentsValue
- paymentMethod
- paymentDescription?
- counterProposalPrice?
- counterProposalNotes?
- status
- createdAt
- updatedAt
```

### 15.2 Histórico

```text
ProposalHistory
- id
- proposalId
- actorUserId
- fromStatus?
- toStatus?
- action
- metadata?
- createdAt
```

### 15.3 Aprovação de proposta

Endpoint de comando:

```text
POST /api/v1/proposals/:id/approve
```

A operação deverá rodar em **uma transação Prisma**:

```text
1. validar proposal/tenant/status
2. atualizar proposta
3. criar Sale
4. atualizar Property -> SOLD
5. criar Commission
6. criar CommissionSplit(s)
7. criar Activity/AuditLog
8. commit
```

Se qualquer parte falhar, nenhuma alteração parcial deve permanecer.

### 15.4 Sale

```text
Sale
- id
- tenantId
- code
- proposalId?
- propertyId
- buyerClientId
- brokerId
- captatorBrokerId?
- finalSalePrice
- saleDate
- paymentType
- contractNumber?
- documentationStatus
- status
```

Para múltiplos vendedores utilizar relação `SaleSeller` com `Client`.

---

## 16. Comissões

Não armazenar comissão como dezenas de colunas fixas.

```text
Commission
- id
- tenantId
- saleId?
- lotSaleId?
- leaseId?
- baseValue
- totalPercentage
- totalValue
- status
- expectedAt?
- receivedAt?
- settledAt?
```

```text
CommissionSplit
- id
- commissionId
- recipientType
- recipientUserId?
- partnerName?
- role
- percentage
- amount
- status
- paidAt?
```

Papéis iniciais:

```text
AGENCY
MANAGER
CAPTATOR
ATTENDANT_BROKER
NEGOTIATOR
PARTNER
```

Regra obrigatória: total dos splits não pode ultrapassar a comissão total.

O split financeiro do gateway será uma camada posterior e não substituirá o livro de comissão do CRM.

---

## 17. Locações

### 17.1 Fluxo

```text
Lead
→ Visita
→ Análise Cadastral
→ Aprovação/Garantia
→ Contrato
→ Vistoria
→ Entrega das Chaves
```

### 17.2 Lease

```text
Lease
- id
- tenantId
- contractNumber
- propertyId
- responsibleBrokerId?
- monthlyRent
- condoFee?
- iptuFee?
- startDate
- endDate
- dueDay
- guaranteeType
- adminFeePercentage
- adjustmentIndex
- nextAdjustmentDate
- status
```

Locatários e proprietários devem ser relações com `Client`.

### 17.3 Cobranças

```text
RentCharge
- id
- leaseId
- competence
- dueDate
- rentAmount
- condoAmount
- iptuAmount
- otherAmount
- discountAmount
- fineAmount
- interestAmount
- totalAmount
- status
```

### 17.4 Recebimentos e repasses

```text
RentPayment
OwnerPayout
RentalExpense
```

Fórmula básica de repasse:

```text
aluguel recebido
- taxa administrativa
- despesas autorizadas
= líquido do proprietário
```

Toda composição deve ficar registrada, não apenas o saldo final.

### 17.5 Vistoria

```text
Inspection
InspectionItem
InspectionMedia
```

Tipos:

```text
ENTRY
PERIODIC
EXIT
```

### 17.6 Manutenção

```text
MaintenanceRequest
ServiceProvider
MaintenanceQuote
MaintenanceEvent
```

---

## 18. Empreendimentos, quadras e lotes

```text
Development
- id
- tenantId
- name
- developerCompany
- location
- launchDate
- deliveryForecast?
- commissionPercentage
- campaignId?
- status
- heroAssetId?
```

```text
DevelopmentBlock
- id
- developmentId
- code
- name
- sortOrder
```

```text
Lot
- id
- tenantId
- developmentId
- blockId
- lotNumber
- areaM2
- basePrice
- promotionalPrice?
- minDownPayment
- maxInstallments
- status
```

Status:

```text
AVAILABLE
RESERVED
PROPOSAL
SOLD
BLOCKED
CANCELLATION
```

### 18.1 Reserva

```text
LotReservation
- lotId
- clientId
- brokerId
- reservedAt
- expiresAt
- status
```

A reserva deve ser protegida contra dupla venda/reserva concorrente por transação e validação de estado.

### 18.2 Simulador

```text
LotSimulation
- lotId
- clientId?
- brokerId
- entryAmount
- installments
- discountAmount
- financedBalance
- interestRate?
- installmentValue
- createdAt
```

### 18.3 Proposta e venda

```text
LotProposal
LotProposalHistory
LotSale
```

---

## 19. Dashboards e relatórios

KPIs devem ser calculados a partir do banco, não mantidos manualmente em `Broker` ou `Tenant`.

Dashboard inicial:

- leads recebidos;
- clientes cadastrados;
- imóveis disponíveis;
- imóveis vendidos;
- imóveis alugados;
- vendas em andamento;
- locações em andamento;
- VGV;
- comissões geradas;
- comissões recebidas;
- contratos ativos;
- aluguéis vencidos;
- ranking de corretores.

Relatórios terão filtros por período, corretor, gerente, operação, origem, campanha, empreendimento e região.

Exportações pesadas deverão ser executadas por job.

---

## 20. Auditoria e histórico

```text
AuditLog
- id
- tenantId
- actorUserId?
- action
- entityType
- entityId
- before?
- after?
- ip?
- userAgent?
- createdAt
```

Registrar obrigatoriamente:

- login relevante/falhas conforme política;
- alteração de cliente/documento;
- mudança de responsável;
- mudança de etapa;
- aprovação/recusa de proposta;
- fechamento de venda;
- mudança de comissão;
- recebimento/repasse;
- consulta CPF/CNPJ;
- OCR de documentos;
- ações financeiras;
- alterações de permissões.

Nunca registrar senha, token ou segredo em logs.

---

## 21. Arquivos e armazenamento

Criar abstração de storage.

```ts
interface StorageProvider {
  put(...): Promise<StoredFile>;
  getSignedUrl(...): Promise<string>;
  delete(...): Promise<void>;
}
```

Primeiro provider pode ser disco local em desenvolvimento.

Produção poderá usar storage S3-compatible sem alterar regras de domínio.

---

## 22. Integrações externas

Todas as integrações devem usar adapters/interfaces.

### 22.1 OCR

```ts
interface OcrProvider {
  process(input: OcrInput): Promise<OcrResult>;
}
```

O CRM não deve assumir um fornecedor específico.

### 22.2 Consulta CPF/CNPJ

```ts
interface PersonLookupProvider {
  lookup(document: string): Promise<PersonLookupResult>;
}
```

Salvar somente os campos necessários e autorizados.

### 22.3 Pagamento/split

```ts
interface PaymentProvider {
  createPayment(...): Promise<PaymentResult>;
  getPayment(...): Promise<PaymentResult>;
  createSplit(...): Promise<SplitResult>;
  refund(...): Promise<RefundResult>;
}
```

Nunca armazenar dados completos de cartão.

### 22.4 WhatsApp

```ts
interface WhatsAppProvider {
  sendText(...): Promise<MessageResult>;
  sendTemplate(...): Promise<MessageResult>;
}
```

### 22.5 IA

```ts
interface AiProvider {
  generate(...): Promise<AiResult>;
}
```

Custos, limites e credenciais são externos ao código de domínio.

---

## 23. IA especialista SENA

A IA não receberá acesso irrestrito ao banco e não executará SQL arbitrário gerado pelo modelo.

Usar ferramentas explícitas e autorizadas:

```text
searchClients
searchProperties
findMatchingProperties
getBrokerPerformance
getCommissionSummary
getOverdueRentals
getExpiringLeases
getAvailableLots
createFollowUpDraft
```

### 23.1 Segurança da IA

- escopo por tenant obrigatório;
- ferramentas read-only por padrão;
- ações de escrita exigem ferramenta específica e permissão;
- ações financeiras/contratuais exigem confirmação do usuário;
- registrar uso e ferramenta chamada;
- não expor segredos ou dados de outro tenant no contexto.

---

## 24. Jobs e tarefas demoradas

Não bloquear requests HTTP para tarefas longas.

Casos:

- OCR;
- IA em lote;
- importação;
- exportação de relatórios;
- geração de documentos;
- notificações em lote;
- conciliação de pagamentos.

A fundação não dependerá obrigatoriamente de Redis.

Criar uma abstração de fila para permitir começar com worker persistido em MySQL e trocar para Redis/BullMQ se necessário.

Processos de produção podem ser separados em:

```text
web/api process
worker process
scheduler process
```

---

## 25. Transações e concorrência

Operações que alteram múltiplas entidades devem utilizar `$transaction` do Prisma.

Obrigatório em:

- aprovação de proposta;
- fechamento de venda;
- geração/alteração de comissão;
- reserva de lote;
- venda de lote;
- recebimento + baixa;
- repasse;
- split financeiro;
- cancelamentos/distratos críticos.

Reserva de lote precisa impedir concorrência dupla.

---

## 26. Testes

### 26.1 Backend

- unitários para regras puras;
- integração com banco de teste;
- e2e da API para fluxos críticos;
- isolamento multi-tenant;
- permissão por perfil;
- transações financeiras;
- idempotência de webhooks.

### 26.2 Frontend

Testar prioritariamente:

- formulários críticos;
- navegação;
- filtros;
- estados loading/error/empty;
- fluxo proposta → venda;
- locação;
- lote/reserva.

### 26.3 Regra de conclusão

Uma etapa não é `CONCLUÍDA` apenas porque compila.

Deve passar:

```text
format
lint
typecheck
tests relevantes
build
```

Se uma validação não puder ser executada, `STATUS.md` deve registrar explicitamente o motivo.

---

## 27. Observabilidade

- logs estruturados;
- request ID/correlation ID;
- logs de integração sem segredos;
- endpoint `/health`;
- endpoint `/ready` quando aplicável;
- tratamento global de exceção;
- webhook events persistidos para diagnóstico/idempotência.

---

## 28. Configuração

`.env.example` deve documentar apenas nomes de variáveis, nunca valores reais.

Grupos esperados:

```text
APP_*
DATABASE_*
AUTH_*
STORAGE_*
MAIL_*
WHATSAPP_*
OCR_*
PERSON_LOOKUP_*
PAYMENT_*
AI_*
```

Validação de env deve ocorrer no boot da API.

---

## 29. Deploy

Arquitetura alvo inicial:

```text
Nginx
│
├── /               -> frontend estático React
└── /api/*          -> Node/NestJS
                         │
                         └── MySQL 8
```

Pode ser executado com PM2/systemd/Docker conforme ambiente final.

O frontend e a API devem preferencialmente compartilhar o mesmo domínio/origem para simplificar cookies e segurança.

---

## 30. Regras para Codex e Claude

### 30.1 Fonte de verdade e leitura econômica

Na primeira rodada do projeto, o agente pode ler os documentos-base necessários para montar a fundação. Depois disso, **não deve reler toda a documentação nem reauditar o repositório em cada troca de agente**.

Ordem padrão de leitura por rodada:

1. `STATUS.md` por completo;
2. somente a etapa atual em `ROADMAP.md`;
3. somente as seções de `ARCHITECTURE.md` citadas no prompt da etapa ou exigidas por uma dúvida concreta;
4. arquivos do módulo a alterar e suas dependências diretas.

Ampliar a leitura apenas se houver inconsistência, dependência desconhecida ou decisão arquitetural ausente. O `STATUS.md` é o handoff operacional entre Codex e Claude; `ARCHITECTURE.md` não deve ser usado como leitura repetitiva obrigatória.

### 30.2 Nunca inventar conclusão

O agente deve diferenciar:

```text
CONCLUÍDO E VALIDADO
IMPLEMENTADO, NÃO VALIDADO
PARCIAL
PENDENTE
BLOQUEADO
```

### 30.3 Trabalho alternado entre Codex e Claude

Codex e Claude **não trabalham em paralelo neste projeto**. Existe apenas um agente ativo por rodada. O próximo agente começa somente depois que o anterior concluir sua missão e registrar o handoff em `STATUS.md`.

Consequências práticas:

- uma única branch de trabalho por etapa;
- não criar branches separadas por agente;
- não duplicar implementação para “comparar soluções”;
- não pedir ao agente seguinte para revisar todo o trabalho anterior por padrão;
- revisão ampla só acontece em checkpoints previstos ou quando um erro concreto justificar.

Como há apenas um agente ativo, ele é o único autorizado naquela rodada a editar `schema.prisma`, migrations, lockfile e configurações globais.

### 30.4 Migrações

- nunca editar migration já aplicada para “corrigir” o histórico;
- criar nova migration;
- nome descritivo;
- não executar `db push` como substituto de migration em ambiente compartilhado/produção;
- migration destrutiva exige análise explícita.

### 30.5 Isolamento de escopo

O agente não deve “melhorar” módulos vizinhos sem necessidade.

Se encontrar problema fora do escopo:

1. registrar em `STATUS.md` como pendência;
2. não fazer refactor amplo escondido dentro da tarefa atual.

### 30.6 Frontend aprovado

Não redesenhar a interface aprovada sem solicitação.

Mudanças permitidas automaticamente:

- conectar API;
- loading/empty/error states;
- acessibilidade;
- responsividade necessária;
- correção de bugs;
- componentes internos sem alteração visual relevante.

### 30.7 Backend é autoridade

Nunca confiar em:

- valor total calculado apenas no browser;
- `tenantId` enviado pelo browser;
- nome do corretor enviado pelo browser quando existe ID;
- status financeiro arbitrário;
- comissão calculada somente no frontend;
- permissões escondidas apenas na interface.

---

## 31. Decisões que exigem aprovação antes de mudar

1. NestJS + Node.js como backend.
2. MySQL 8 + Prisma.
3. React/Vite como frontend.
4. protótipo aprovado como base visual.
5. monorepo npm workspaces.
6. multi-tenant desde a fundação.
7. `Client` unificado com múltiplos papéis.
8. comissão normalizada em splits.
9. integrações via adapters.
10. IA sem SQL arbitrário.
11. backend como autoridade de regras.

---

## 32. Objetivo da primeira entrega técnica

Antes de implementar todos os módulos, a base deverá conseguir provar este fluxo:

```text
Login
  ↓
Tenant SENA
  ↓
Cadastrar cliente
  ↓
Cadastrar lead
  ↓
Cadastrar imóvel e proprietário
  ↓
Relacionar cliente/interesse
  ↓
Persistir em MySQL
  ↓
Recarregar navegador
  ↓
Dados continuam disponíveis
```

Quando esse fluxo existir com autenticação, tenant, validação, testes e interface aprovada conectada, a fundação estará pronta para expansão.
