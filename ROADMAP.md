# ROADMAP.md — SENA CRM Imobiliário 2026

**Data-base:** 16/08/2026  
**Estratégia:** preservar o frontend React aprovado e construir backend próprio em NestJS + Prisma + MySQL em etapas verificáveis.

---

## Regras do roadmap

Cada etapa deve terminar com atualização do `STATUS.md`.

Estados permitidos:

- `PENDENTE`
- `EM ANDAMENTO`
- `PARCIAL`
- `IMPLEMENTADO, NÃO VALIDADO`
- `CONCLUÍDO E VALIDADO`
- `BLOQUEADO`

Nenhuma etapa deve ser marcada como concluída sem validação.

---

# ETAPA 0 — Fundação do monorepo e preservação do protótipo

**Prioridade:** P0  
**Status inicial:** PENDENTE

## Objetivo

Transformar o ZIP aprovado em um repositório de produto, sem mudar sua identidade visual, e criar a API NestJS vazia porém executável.

## Backend

- [ ] criar monorepo npm workspaces;
- [ ] mover protótipo para `apps/web` preservando Git history quando houver;
- [ ] criar `apps/api` com NestJS;
- [ ] criar `packages/shared`;
- [ ] configurar Node >=22.12;
- [ ] adicionar Prisma e conexão MySQL;
- [ ] criar `PrismaModule`/serviço de banco;
- [ ] criar `/health`;
- [ ] criar `/ready` se houver dependências que justifiquem;
- [ ] adicionar validação de `.env`;
- [ ] configurar tratamento global de erros;
- [ ] configurar logs estruturados/request ID;
- [ ] configurar Swagger/OpenAPI em desenvolvimento;
- [ ] preparar lint, format, typecheck e test.

## Frontend

- [ ] fazer o protótipo compilar sem alteração visual;
- [ ] adicionar dependência `recharts` usada pelo código mas ausente no `package.json`;
- [ ] resolver/remover referência ausente a `utils/senaZipExporter`;
- [ ] manter mocks temporariamente;
- [ ] criar API client base;
- [ ] criar configuração `VITE_API_URL`;
- [ ] adicionar React Router sem redesenhar telas;
- [ ] preservar URL `/dashboard` como entrada autenticada futura.

## Banco

- [ ] criar MySQL de desenvolvimento;
- [ ] primeira migration técnica;
- [ ] seed mínimo do tenant SENA.

## Critérios de aceite

- `npm install` funciona na raiz;
- `npm run dev` inicia web e API;
- web abre com a interface aprovada;
- `GET /api/v1/health` responde OK;
- API conecta no MySQL;
- migrations executam do zero;
- `format`, `lint`, `typecheck`, testes básicos e builds executam.

---

# ETAPA 1 — Autenticação, tenant, usuários e permissões

**Prioridade:** P0  
**Dependência:** Etapa 0

## Objetivo

Criar fundação segura de acesso e isolamento por imobiliária.

## Entidades

- [ ] Tenant
- [ ] User
- [ ] BrokerProfile
- [ ] Team
- [ ] RefreshSession/token revogável
- [ ] AuditLog inicial

## Funcionalidades

- [ ] login;
- [ ] logout;
- [ ] refresh de sessão;
- [ ] usuário atual `/auth/me`;
- [ ] recuperação de senha;
- [ ] Argon2id;
- [ ] cookie HttpOnly/Secure em produção;
- [ ] CSRF quando aplicável;
- [ ] rate limit no login;
- [ ] roles ADMIN / MANAGER / BROKER;
- [ ] guards/decorators de permissão;
- [ ] tenant obtido do contexto autenticado;
- [ ] seed de administrador SENA somente por variável segura/dev seed.

## Frontend

- [ ] tela de login coerente com visual SENA;
- [ ] `AuthProvider` apenas para sessão, não para dados de domínio;
- [ ] rotas protegidas;
- [ ] sidebar condicionada a permissões;
- [ ] logout real.

## Testes obrigatórios

- login correto/incorreto;
- cookie/sessão;
- usuário inativo;
- usuário sem permissão;
- tenant A não acessa usuário/dado do tenant B.

## Critério de aceite

É impossível entrar no painel sem autenticação real e toda request autenticada conhece `userId`, `role` e `tenantId` sem confiar em dados enviados pelo frontend.

---

# ETAPA 2 — Clientes, corretores, leads, origens e funil

**Prioridade:** P0  
**Dependência:** Etapa 1

## Objetivo

Eliminar os primeiros mocks do protótipo e tornar o CRM comercial persistente.

## Entidades

- [ ] Client
- [ ] ClientRoleAssignment
- [ ] LeadOrigin
- [ ] Campaign
- [ ] Lead
- [ ] LeadStatusHistory
- [ ] Activity/ContactEvent

## Clientes

- [ ] pessoa física/jurídica;
- [ ] CPF/CNPJ normalizado e protegido;
- [ ] telefone;
- [ ] WhatsApp;
- [ ] e-mail;
- [ ] papéis múltiplos;
- [ ] corretor responsável;
- [ ] último/próximo contato;
- [ ] observações;
- [ ] prevenção de duplicidade por documento e regras de contato.

## Leads

- [ ] origem obrigatória;
- [ ] campanha opcional;
- [ ] responsável;
- [ ] orçamento estimado;
- [ ] funil SENA;
- [ ] motivo obrigatório em perdido;
- [ ] histórico de mudança de estágio;
- [ ] filtros/paginação/pesquisa.

## Corretores

- [ ] CRECI;
- [ ] equipe;
- [ ] gerente;
- [ ] status;
- [ ] permissões por perfil.

## Frontend

- [ ] `LeadsFunnelModule` usando API;
- [ ] módulo de clientes usando API;
- [ ] módulo de corretores usando API;
- [ ] remover `INITIAL_LEADS` e `INITIAL_BROKERS` do fluxo real;
- [ ] loading/error/empty states;
- [ ] URLs reais.

## Testes obrigatórios

- CRUD cliente;
- duplicidade CPF/CNPJ;
- CRUD lead;
- transição válida/inválida de status;
- lostReason;
- permissões;
- isolamento tenant.

## Critério de aceite

Cadastrar cliente/lead pelo frontend, recarregar a página e encontrar exatamente o mesmo registro no MySQL.

---

# ETAPA 3 — Imóveis, proprietários, mídia, interesse e matching

**Prioridade:** P0

## Entidades

- [ ] Property
- [ ] PropertyOwner
- [ ] PropertyFeature
- [ ] Asset
- [ ] PropertyMedia
- [ ] PropertyDocument
- [ ] InterestProfile
- [ ] tabelas auxiliares de preferências/regiões

## Funcionalidades

- [ ] código único por tenant;
- [ ] múltiplos proprietários;
- [ ] corretor captador;
- [ ] venda/locação/ambos;
- [ ] endereço brasileiro;
- [ ] preços;
- [ ] características;
- [ ] status;
- [ ] exclusividade;
- [ ] fotos;
- [ ] documentos;
- [ ] busca/filtros;
- [ ] perfil de interesse;
- [ ] matching cliente ↔ imóvel com score e justificativas.

## Frontend

- [ ] `PropertiesModule` usando API;
- [ ] `PropertyDetailModal` usando dados reais;
- [ ] `ClientsMatchingModule` usando API;
- [ ] upload real de imagens/documentos;
- [ ] remover `INITIAL_PROPERTIES` do fluxo real.

## Testes

- múltiplos proprietários;
- isolamento de mídia/documento;
- matching;
- status;
- filtros;
- permissões.

---

# ETAPA 4 — Visitas, propostas, vendas e comissões

**Prioridade:** P0

## Visitas

- [ ] Visit;
- [ ] agenda;
- [ ] status;
- [ ] feedback;
- [ ] impressão do cliente;
- [ ] vínculo cliente/imóvel/corretor.

## Propostas

- [ ] Proposal;
- [ ] ProposalHistory;
- [ ] contraproposta;
- [ ] recusa;
- [ ] aprovação;
- [ ] validações de estado.

## Vendas

- [ ] Sale;
- [ ] SaleSeller;
- [ ] contrato/documentação;
- [ ] financiamento quando informado;
- [ ] status do imóvel atualizado automaticamente.

## Comissões

- [ ] Commission;
- [ ] CommissionSplit;
- [ ] regras por operação;
- [ ] imobiliária;
- [ ] gerente;
- [ ] captador;
- [ ] atendimento;
- [ ] negociação;
- [ ] parceiro;
- [ ] prevista/recebida/distribuída/quitada;
- [ ] saldo.

## Transação crítica

Implementar aprovação de proposta atomicamente:

```text
Proposal -> Sale -> Property SOLD -> Commission -> Splits -> Audit
```

## Frontend

- [ ] `VisitsModule` real;
- [ ] `ProposalsSalesModule` real;
- [ ] `CommissionsModule` real;
- [ ] remover respectivos mocks do fluxo real.

## Testes

- aprovação atomicamente;
- rollback forçado;
- contraproposta;
- comissão fecha exatamente no total;
- imóvel vendido não pode ser vendido novamente sem fluxo autorizado;
- tenant isolation.

---

# ETAPA 5 — Locações e administração imobiliária

**Prioridade:** P0/P1

## Entidades

- [ ] Lease
- [ ] LeaseTenant
- [ ] LeaseOwner snapshot/relation quando necessário
- [ ] RentCharge
- [ ] RentPayment
- [ ] OwnerPayout
- [ ] RentalExpense
- [ ] Inspection
- [ ] InspectionItem
- [ ] InspectionMedia
- [ ] MaintenanceRequest
- [ ] ServiceProvider
- [ ] MaintenanceQuote

## Fluxo

- [ ] Lead;
- [ ] Visita;
- [ ] Análise cadastral;
- [ ] Aprovação/garantia;
- [ ] Contrato;
- [ ] Vistoria;
- [ ] Entrega de chaves.

## Administração

- [ ] mensalidades/competências;
- [ ] vencimento;
- [ ] baixa de pagamento;
- [ ] multa/juros quando configurados;
- [ ] inadimplência;
- [ ] taxa administrativa;
- [ ] reajuste;
- [ ] fim/renovação/distrato;
- [ ] recibos;
- [ ] repasses;
- [ ] despesas autorizadas.

## Frontend

Integrar todas as subáreas já previstas em `RentalsModule`.

## Testes

- cálculo de repasse;
- cobrança vencida;
- baixa;
- reajuste;
- vistoria;
- manutenção;
- isolamento tenant.

---

# ETAPA 6 — Empreendimentos, quadras, lotes e espelho de vendas

**Prioridade:** P0/P1

## Entidades

- [ ] Development
- [ ] DevelopmentBlock
- [ ] Lot
- [ ] LotSimulation
- [ ] LotReservation
- [ ] LotProposal
- [ ] LotProposalHistory
- [ ] LotSale

## Funcionalidades

- [ ] empreendimento;
- [ ] incorporadora;
- [ ] localização;
- [ ] lançamento/previsão;
- [ ] comissão;
- [ ] campanha;
- [ ] quadras;
- [ ] lotes;
- [ ] preços/promos;
- [ ] entrada mínima;
- [ ] parcelamento;
- [ ] espelho visual;
- [ ] simulador;
- [ ] reserva com expiração;
- [ ] proposta;
- [ ] aprovação;
- [ ] contrato;
- [ ] venda;
- [ ] distrato;
- [ ] prevenção de dupla reserva/venda.

## Dashboard do empreendimento

- [ ] total lotes;
- [ ] disponíveis;
- [ ] reservados;
- [ ] vendidos;
- [ ] VGV total;
- [ ] VGV vendido;
- [ ] leads;
- [ ] visitas;
- [ ] propostas;
- [ ] vendas;
- [ ] comissão;
- [ ] ranking.

## Frontend

Integrar `DevelopmentsLotsModule` preservando o espelho aprovado.

## Teste crítico

Duas requests simultâneas tentando reservar o mesmo lote: somente uma pode vencer.

---

# ETAPA 7 — Dashboard, relatórios, alertas e automações

**Prioridade:** P1

## Dashboard

- [ ] leads;
- [ ] clientes;
- [ ] imóveis;
- [ ] vendas;
- [ ] locações;
- [ ] VGV;
- [ ] comissões;
- [ ] contratos;
- [ ] inadimplência;
- [ ] ranking.

## Relatórios

- [ ] corretor;
- [ ] gerente;
- [ ] período;
- [ ] origem;
- [ ] campanha;
- [ ] operação;
- [ ] empreendimento;
- [ ] bairro/região;
- [ ] VGV;
- [ ] comissão;
- [ ] conversão;
- [ ] locações/administração.

## Alertas

- [ ] lead sem retorno;
- [ ] visita próxima;
- [ ] proposta expirando;
- [ ] reserva expirando;
- [ ] exclusividade vencendo;
- [ ] documento pendente;
- [ ] contrato de locação vencendo;
- [ ] reajuste;
- [ ] aluguel vencido;
- [ ] repasse pendente;
- [ ] comissão a receber.

## Jobs

- [ ] worker;
- [ ] scheduler;
- [ ] retries controlados;
- [ ] idempotência;
- [ ] painel/log técnico mínimo.

---

# ETAPA 8 — Integrações: CPF/CNPJ, OCR, WhatsApp e split

**Prioridade:** P1

## Infraestrutura comum

- [ ] IntegrationCredential seguro;
- [ ] adapter por provider;
- [ ] timeout;
- [ ] retry;
- [ ] circuit/failure handling;
- [ ] request log sanitizado;
- [ ] webhook event idempotente.

## CPF/CNPJ

- [ ] provider interface;
- [ ] consulta manual autorizada;
- [ ] auditoria;
- [ ] persistir somente resultado necessário;
- [ ] tratamento de indisponibilidade/limite.

## OCR

- [ ] upload;
- [ ] fila;
- [ ] provider;
- [ ] resultado estruturado;
- [ ] tela de revisão humana antes de preencher dados importantes.

## WhatsApp

- [ ] envio técnico;
- [ ] templates quando necessário;
- [ ] histórico de mensagens;
- [ ] opt-out/regras do provedor;
- [ ] custos externos fora da aplicação.

## Pagamento/split

- [ ] Payment;
- [ ] PaymentRecipient quando necessário;
- [ ] PaymentSplit;
- [ ] webhook;
- [ ] conciliação;
- [ ] idempotência;
- [ ] vínculo com CommissionSplit;
- [ ] nunca armazenar dados completos de cartão.

---

# ETAPA 9 — IA especialista em imobiliária

**Prioridade:** P1/P2

## Base

- [ ] AiProvider abstraction;
- [ ] configuração por tenant;
- [ ] registro de consumo;
- [ ] conversas/mensagens;
- [ ] limites e permissões.

## Ferramentas read-only

- [ ] buscar clientes;
- [ ] buscar imóveis;
- [ ] matching;
- [ ] desempenho de corretores;
- [ ] comissões;
- [ ] aluguéis vencidos;
- [ ] contratos próximos de vencer;
- [ ] lotes disponíveis;
- [ ] resumo de pipeline.

## Ferramentas assistivas

- [ ] rascunho de follow-up;
- [ ] descrição de imóvel;
- [ ] resumo de cliente;
- [ ] resumo de negociação;
- [ ] resposta a objeções;
- [ ] sugestão de imóveis.

## Segurança

- [ ] sem SQL arbitrário;
- [ ] tenant obrigatório;
- [ ] read-only por padrão;
- [ ] escrita somente via tool explícita;
- [ ] confirmação para ação sensível;
- [ ] auditoria.

---

# ETAPA 10 — Hardening, homologação e entrega

**Prioridade:** P0 antes de produção

## Segurança

- [ ] revisão OWASP básica;
- [ ] autorização endpoint a endpoint;
- [ ] tenant isolation suite;
- [ ] uploads;
- [ ] secrets;
- [ ] rate limits;
- [ ] CSRF/CORS/cookies;
- [ ] logs sanitizados;
- [ ] validação de webhooks.

## Banco

- [ ] índices;
- [ ] planos de consulta críticos;
- [ ] backup/restore documentado;
- [ ] migration do zero;
- [ ] seed sem dados sensíveis reais.

## UX

- [ ] mobile;
- [ ] loading;
- [ ] erro;
- [ ] empty state;
- [ ] permissões;
- [ ] acessibilidade básica;
- [ ] páginas 404/500.

## Qualidade

- [ ] format;
- [ ] lint;
- [ ] typecheck;
- [ ] tests;
- [ ] build web;
- [ ] build api;
- [ ] testes de smoke em produção/staging.

## Deploy

- [ ] Nginx/reverse proxy;
- [ ] HTTPS;
- [ ] Node process;
- [ ] worker;
- [ ] scheduler;
- [ ] MySQL;
- [ ] variáveis;
- [ ] healthcheck;
- [ ] procedimento rollback.

---

# Protocolo econômico para Codex + Claude — trabalho alternado

## Regra principal

Codex e Claude trabalham **em turnos, nunca em paralelo**. Cada turno deve produzir uma entrega utilizável e deixar o repositório em estado claro para o próximo agente.

O objetivo é minimizar tokens de leitura, diagnóstico e repetição. O agente não deve começar com uma auditoria geral se `STATUS.md` já informa o estado real.

## Contexto mínimo por turno

O prompt de cada rodada deve mandar o agente:

1. ler `STATUS.md` inteiro;
2. ler apenas a etapa atual deste `ROADMAP.md`;
3. consultar apenas as seções de `ARCHITECTURE.md` indicadas no prompt;
4. inspecionar os arquivos diretamente envolvidos antes de editar;
5. só expandir a investigação se surgir uma dependência concreta.

Não pedir repetidamente: “analise toda a arquitetura”, “audite o projeto”, “leia todos os arquivos”, “rode toda a suíte antes de começar”.

## Tamanho ideal de uma rodada

Uma rodada deve cobrir um **bloco funcional completo**, não uma microtarefa. Exemplos bons: fundação inteira, autenticação inteira, clientes+leads, imóveis+matching. Evitar gastar um turno apenas criando uma entidade ou corrigindo um arquivo pequeno quando isso puder ser resolvido dentro da rodada corrente.

## Estratégia de testes e validação econômica

### Durante a implementação

- não executar a suíte completa depois de cada arquivo;
- não rodar `format`, `lint`, `typecheck`, `test` e `build` repetidamente;
- concluir primeiro o bloco coerente de alterações;
- rodar testes direcionados ao módulo alterado **uma vez ao final do bloco**;
- ao corrigir uma falha, rerodar somente o comando que falhou;
- não despejar logs enormes no chat: resumir sucesso e, em falha, mostrar apenas erro relevante e contexto suficiente.

### Check rápido por rodada

Quando aplicável:

```text
1. testes do módulo/arquivos alterados
2. typecheck do workspace afetado
3. build somente se a alteração puder quebrar empacotamento/integração
```

### Checkpoint completo

A bateria completa (`format:check`/lint/typecheck/tests/build web+api) deve rodar apenas:

- no fechamento da Etapa 0;
- no fechamento da Etapa 2;
- no fechamento da Etapa 4;
- no fechamento da Etapa 6;
- antes de integrar provedores externos na Etapa 8;
- no hardening/entrega da Etapa 10;
- ou antes disso somente se uma mudança global justificar.

Testes de segurança, isolamento de tenant, dinheiro e transações críticas **não são opcionais**; a economia vem de executá-los em lote, não de removê-los.

## Regra de migrations

Como os agentes são alternados, somente o agente ativo altera schema/migrations. Ele deve agrupar as entidades da rodada em uma migration coerente sempre que seguro, em vez de criar uma migration por pequeno ajuste. Nunca reescrever migration já aplicada em ambiente compartilhado.

## Handoff obrigatório e curto

No final da rodada o agente atualiza `STATUS.md` sem relatório longo. Registrar apenas:

```text
ETAPA/RODADA:
ESTADO: CONCLUÍDO E VALIDADO | IMPLEMENTADO, NÃO VALIDADO | PARCIAL | BLOQUEADO
ALTERADO: arquivos/módulos principais
VALIDADO: comandos executados e resultado curto
PENDÊNCIAS: somente bloqueios/reais dívidas
PRÓXIMA AÇÃO EXATA: uma frase
```

Não copiar novamente a arquitetura nem narrar todo o raciocínio.

## Regras para economizar tokens do agente

- preferir editar diretamente em vez de explicar código antes de editar;
- não recontar o escopo do CRM na resposta final;
- não gerar documentação nova se `ARCHITECTURE.md`, `ROADMAP.md` ou `STATUS.md` já cobrem o assunto;
- não refatorar módulos fora da missão atual;
- não trocar biblioteca/stack por preferência pessoal;
- não criar abstração “para o futuro” sem uso na etapa;
- usar erros reais e testes existentes para guiar investigação;
- quando um comando falhar por ambiente/dependência externa, registrar uma vez e seguir o que puder ser validado localmente;
- respostas finais do agente devem ser curtas e operacionais.

---

# Prompts operacionais por etapa

Os prompts abaixo são feitos para serem copiados quase sem contexto adicional. Antes de enviar, troque apenas o nome do agente se desejar. O agente deve **executar**, não devolver um novo plano.

## PROMPT E0 — Fundação

```text
Continue o SENA CRM pela ETAPA 0. Trabalhe diretamente no código.

Contexto já decidido: frontend React 19 + Vite + TypeScript aprovado pelo cliente; backend novo NestJS 11 + Prisma + MySQL 8; Node >=22.12; monorepo npm workspaces; InsulaCRM não será runtime. Não altere o design.

Leia STATUS.md inteiro, a ETAPA 0 do ROADMAP.md e, em ARCHITECTURE.md, somente as seções 1–6 e 30. Depois inspecione apenas package files e arquivos necessários do protótipo. Não faça nova auditoria geral.

Execute a Etapa 0 inteira: organizar apps/web, criar apps/api e packages/shared, corrigir os bloqueios reais do protótipo (recharts e senaZipExporter), configurar workspaces/Node/env, Nest, Prisma/MySQL, /api/v1/health, tratamento básico de erros/logs e API client base. Preserve mocks e aparência.

Validação: só após concluir o bloco, rode a bateria completa prevista para o checkpoint da Etapa 0. Corrija apenas falhas causadas por esta etapa; registre bloqueios externos sem refatorar o projeto inteiro.

Ao terminar, atualize STATUS.md no formato curto de handoff e pare. Não avance para autenticação.
```

## PROMPT E1 — Auth, tenant e usuários

```text
Continue o SENA CRM pela ETAPA 1. Não reaudite o projeto. Leia STATUS.md, a ETAPA 1 do ROADMAP.md e, em ARCHITECTURE.md, apenas 7, 8, 9 e 30. Inspecione os módulos de auth/tenant/users e o schema atual.

Implemente o bloco completo de autenticação e isolamento inicial: Tenant, User, BrokerProfile, Team, sessão/refresh revogável, login/logout/me, recuperação de senha, Argon2id, cookie HttpOnly, guards/roles ADMIN-MANAGER-BROKER, tenant vindo do contexto autenticado e AuditLog inicial. Conecte login/logout e rotas protegidas ao frontend sem redesenhar.

Escreva os testes críticos de auth/permissão/tenant. No fim rode apenas testes direcionados + typecheck dos workspaces afetados; não rode a suíte completa salvo erro global.

Atualize STATUS.md com handoff curto e pare na fronteira da Etapa 1.
```

## PROMPT E2 — Clientes, corretores, leads e funil

```text
Continue pela ETAPA 2. Leia STATUS.md, a ETAPA 2 do ROADMAP.md e ARCHITECTURE.md seções 10, 11 e 30. Não revise módulos concluídos sem erro concreto.

Implemente em um bloco Client unificado + papéis, BrokerProfile/Team necessários, LeadOrigin, Campaign, Lead, histórico de estágio e atividades. CPF/CNPJ deve seguir o modelo protegido definido na arquitetura; origem é obrigatória; LOST exige motivo; tenant nunca vem do body. Integre Clientes, Corretores e Leads/Funil do protótipo à API e remova os mocks somente desses fluxos. Preserve a UI.

Escreva testes direcionados para CRUD essencial, duplicidade de documento, transições, lostReason, permissão e isolamento. Ao final rode esses testes e então o checkpoint completo da Etapa 2 uma única vez.

Atualize STATUS.md curto e pare.
```

## PROMPT E3 — Imóveis e matching

```text
Continue pela ETAPA 3. Leia STATUS.md, a ETAPA 3 do ROADMAP.md e ARCHITECTURE.md seções 12, 13 e 30.

Implemente Property, PropertyOwner, características, assets/mídia/documentos, InterestProfile e matching. O imóvel não pertence a Lead; suporte múltiplos proprietários, captador, SALE/RENT/BOTH, endereço brasileiro, preços, exclusividade e status. Binários não vão para MySQL. Integre PropertiesModule, PropertyDetailModal e ClientsMatchingModule à API sem alterar o design.

Teste somente casos críticos do módulo: múltiplos proprietários, tenant em mídia/documentos, matching, filtros/status e permissões. Rode typecheck dos workspaces afetados uma vez ao final. Sem suíte completa nesta etapa salvo necessidade concreta.

Atualize STATUS.md e pare.
```

## PROMPT E4 — Visitas, propostas, vendas e comissões

```text
Continue pela ETAPA 4. Leia STATUS.md, a ETAPA 4 do ROADMAP.md e ARCHITECTURE.md seções 14–16 e 30.

Implemente Visit, Proposal/History, Sale/SaleSeller, Commission/CommissionSplit e integre as telas existentes. A aprovação de proposta é comando transacional: validar -> aprovar -> criar venda -> marcar imóvel SOLD -> gerar comissão/splits -> audit, tudo na mesma transação Prisma. Backend calcula valores e estados; frontend não é autoridade.

Crie testes críticos de transação/rollback, contraproposta, soma de comissão, dupla venda e tenant. Ao final rode testes direcionados e o checkpoint completo da Etapa 4 uma única vez.

Atualize STATUS.md curto e pare.
```

## PROMPT E5 — Locações

```text
Continue pela ETAPA 5. Leia STATUS.md, a ETAPA 5 do ROADMAP.md e em ARCHITECTURE.md somente a seção de Locações/financeiro correspondente e 30.

Implemente o domínio de locação de ponta a ponta necessário às telas já aprovadas: Lease e participantes, cobranças, pagamentos, repasses, despesas, reajustes, vistorias e manutenção/provedores/orçamentos. Reutilize Client e Property; não duplique proprietário/locatário. Valores financeiros usam Decimal e histórico não pode ser apagado fisicamente por ação comum. Integre RentalsModule gradualmente, removendo somente os mocks do módulo.

Priorize testes de cálculo de repasse, vencimento/baixa, reajuste, vistoria/manutenção e tenant. Rode apenas testes direcionados + typecheck no fechamento da rodada.

Atualize STATUS.md e pare.
```

## PROMPT E6 — Empreendimentos e lotes

```text
Continue pela ETAPA 6. Leia STATUS.md, a ETAPA 6 do ROADMAP.md e apenas a seção de empreendimentos/lotes em ARCHITECTURE.md + seção 30.

Implemente Development, Block, Lot, Simulation, Reservation, Proposal/History e LotSale, incluindo regras de preço/parcelamento, espelho de vendas, expiração de reserva e prevenção de dupla reserva/venda. Integre DevelopmentsLotsModule preservando exatamente o visual aprovado.

O teste crítico é concorrência: duas tentativas de reservar o mesmo lote não podem vencer. Faça os demais testes direcionados necessários. Ao final execute o checkpoint completo da Etapa 6 uma única vez.

Atualize STATUS.md e pare.
```

## PROMPT E7 — Dashboard, relatórios e alertas

```text
Continue pela ETAPA 7. Leia STATUS.md e a ETAPA 7 do ROADMAP.md; consulte ARCHITECTURE.md apenas para regras de jobs, auditoria e métricas que forem necessárias.

Conecte Dashboard e Reports aos dados reais sem persistir métricas deriváveis desnecessariamente. Implemente consultas agregadas, filtros e ranking. Adicione jobs/scheduler apenas para alertas realmente definidos na etapa, com idempotência e retries controlados.

Teste queries/agregações críticas e jobs afetados; execute typecheck no fim. Não rode suíte completa se não houver alteração global. Atualize STATUS.md curto e pare.
```

## PROMPT E8 — Integrações

```text
Continue pela ETAPA 8. Leia STATUS.md, a ETAPA 8 do ROADMAP.md e somente as seções de integrações/segurança em ARCHITECTURE.md.

Antes de conectar provedores, execute uma vez o checkpoint completo previsto. Depois implemente adapters e infraestrutura comum para CPF/CNPJ, OCR, WhatsApp e pagamentos/split sem acoplar o domínio a um fornecedor. Segredos ficam em env/credential seguro; webhooks são idempotentes; logs são sanitizados; não persistir retorno bruto desnecessário nem dados completos de cartão. Se credenciais reais não existirem, implemente provider fake/dev e deixe o provider real configurável, sem bloquear o restante.

Teste adapters/contratos e webhooks de forma direcionada. Atualize STATUS.md e pare.
```

## PROMPT E9 — IA especialista

```text
Continue pela ETAPA 9. Leia STATUS.md, a ETAPA 9 do ROADMAP.md e somente a seção de IA/segurança em ARCHITECTURE.md.

Implemente AiProvider, configuração/consumo/conversas e ferramentas de negócio começando read-only. Não permita SQL arbitrário. Toda tool deve aplicar tenant e permissão no backend. Escritas, se houver, só por ferramenta explícita e ação sensível exige confirmação. Conecte a interface de IA já prevista sem redesenhar.

Teste isolamento/permite-nega das tools e um conjunto pequeno de fluxos representativos; não faça bateria global nesta etapa salvo mudança transversal. Atualize STATUS.md e pare.
```

## PROMPT E10 — Hardening e entrega

```text
Execute a ETAPA 10. Leia STATUS.md, a ETAPA 10 do ROADMAP.md e as seções de segurança/deploy de ARCHITECTURE.md. Agora sim faça revisão transversal, mas guiada pelos itens da etapa, sem refactors estéticos.

Feche autorização endpoint a endpoint, tenant isolation, uploads, secrets, rate limits, CSRF/CORS/cookies, webhooks, índices/queries, backup/restore, UX de erro/loading/empty, acessibilidade básica e deploy/rollback. Rode a bateria completa final uma única vez; em falha, corrija e rerode somente o comando afetado até estabilizar, depois uma última bateria completa para confirmação.

Atualize STATUS.md com estado final real, sem declarar concluído o que não foi validado.
```

---

# Ordem de prioridade para o cliente enxergar progresso

A ordem técnica e a ordem visual serão combinadas:

```text
1. Login real
2. Leads reais
3. Clientes reais
4. Imóveis reais
5. Funil real
6. Visitas
7. Propostas
8. Vendas/comissões
9. Locações
10. Loteamentos
11. Dashboards/relatórios
12. Integrações
13. IA
```

Isso permite que o cliente continue vendo a interface já aprovada enquanto cada bloco deixa de ser mock e passa a ser funcional.
