# STATUS.md — SENA CRM Imobiliário 2026

**Última atualização:** 16/08/2026  
**Fase atual:** Etapa 6 concluída — empreendimentos e lotes  
**Estado geral:** ETAPAS 0–6 CONCLUÍDAS

---

## Etapa 6 — Pronto

**Development (ARCHITECTURE.md §18)**: empreendimento com name, developerCompany, location, launchDate,
deliveryForecast, commissionPercentage, campaignId, status, heroAssetId.

**DevelopmentBlock**: quadras com code (único por dev), name, sortOrder.

**Lot**: lotes com lotNumber, areaM2, basePrice, promotionalPrice, minDownPayment, maxInstallments (120 padrão),
status (AVAILABLE/RESERVED/PROPOSAL/SOLD/BLOCKED/CANCELLATION).

**LotReservation (§18.1)**: proteção contra dupla reserva via transação atômica. Expira em expiresAt.
Status: ACTIVE/EXPIRED/CANCELLED/CONVERTED_TO_PROPOSAL.

**LotSimulation (§18.2)**: entryAmount, installments, discountAmount, financedBalance, interestRate,
installmentValue calculada com juros compostos.

**LotProposal + LotProposalHistory (§18.3)**: draft → sent → accepted → approved. History tracks transitions.

**LotSale**: finalPrice, entryAmount, installments, contractNumber. Criada atomicamente na aprovação.
Atualiza lote para SOLD.

**Isolamento**: tenant-scoped em todas as entidades.

**Schema**: 8 tabelas novas + relações em Tenant/User/Client. Migration 20260816240000.

**Serviços**: DevelopmentsService (CRUD), LotsService (reserve + simulate), LotProposalsService (workflow).

**Teste crítico**: reserva usa $transaction para prevenir dupla venda. Status é verificado dentro da transação.

---

## Estado compilação

format ✓ · lint 0 · typecheck 0 · build ✓ · migrate ✓

---

## Próximo

PROMPT E7: dashboards, relatórios e alertas. Parar lá.
