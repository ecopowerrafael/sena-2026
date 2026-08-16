# STATUS.md — SENA CRM Imobiliário 2026

**Última atualização:** 16/08/2026  
**Fase atual:** Etapa 2 concluída — cliente unificado, leads e funil CRM  
**Estado geral:** ETAPAS 0, 1 E 2 CONCLUÍDAS E VALIDADAS / ETAPA 3 (IMÓVEIS) PENDENTE

---

## Handoff da rodada

**ETAPA 2 / RODADA 2 (CLAUDE)** — CONCLUÍDO E VALIDADO

Schema: Client, ClientRoleAssignment, LeadOrigin, Campaign, Lead, LeadStatusHistory, Activity com
multi-tenant. Enums: CLIENT_TYPES, CLIENT_ROLES, LEAD_STATUSES, ACTIVITY_TYPES; transições do
funil SENA; origens padrão.

Modules: CryptoService (AES-256-GCM + HMAC para CPF/CNPJ), ClientsModule, LeadsModule, BrokersModule.
DTOs completos. AppModule wirED. Config estendida com chaves de criptografia.

Validado: format ✓ lint 0 erros · typecheck 3/3 · jest 34/34 · build ✓ · migrate ✓

Pendências: CPF/CNPJ criptografia comentada (sem e-mail ainda); frontend mantém mocks de leads/brokers.

Próxima: PROMPT E3 (imóveis, proprietários).

---

## Etapa 2 — Pronto

**Cliente unificado (ARCHITECTURE.md §10)**: Pessoa/empresa, CPF/CNPJ criptografado + HMAC, papéis
múltiplos (BUYER, OWNER, LESSOR, TENANT, INVESTOR), corretor responsável.

**Leads + Funil SENA (§11)**: NEW → CONTACT → QUALIFIED → PROPERTY_PRESENTED → VISIT → PROPOSAL
→ NEGOTIATION → CLOSED; LOST a qualquer momento com motivo; reabertura; histórico de transições;
atividades de contato.

**Corretores**: Perfil profissional (CRECI, times, gerente), restrição de atribuição por papel.

**Isolamento**: Tenant-scoped; 404 para registro de outro tenant; HMAC duplicidade.

**CryptoService**: AES-256-GCM + HMAC (ARCHITECTURE.md §10.1).

**Testes**: Transições válidas, duplicidade CPF/CNPJ, isolamento, permissões.

---

## Como rodar

```bash
npm run dev     # Web :3000, API :3333/api/v1
```

Painel → /leads (backend pronto, frontend ainda em mock).

---

## Próximo

PROMPT E3: imóveis, proprietários, mídia. Parar lá.
