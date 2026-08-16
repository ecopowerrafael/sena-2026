# STATUS.md — SENA CRM Imobiliário 2026

**Última atualização:** 16/08/2026  
**Fase atual:** Etapa 5 concluída — locações completo  
**Estado geral:** ETAPAS 0–5 CONCLUÍDAS

---

## Etapa 5 — Pronto

**Lease (ARCHITECTURE.md §17)**: contrato com monthlyRent, condoFee, iptu, dueDay, adminFeePercentage,
adjustmentIndex/nextAdjustmentDate, status (ACTIVE/PAUSED/COMPLETED/TERMINATED).

**LeaseTenant + LeaseOwner**: múltiplos participantes com percentual, relações com Client (reutilizado).

**RentCharge (§17.3)**: competência, rentAmount/condoAmount/iptuAmount/otherAmount, desconto/multa/juros,
totalAmount, status (PENDING/PARTIAL/PAID/OVERDUE/CANCELLED).

**RentPayment**: recebimentos parciais com receiptUrl; status da cobrança atualizado automaticamente.

**OwnerPayout (§17.4)**: cálculo atômico: aluguel recebido - taxa adm - despesas autorizadas = líquido.
Fórmula registrada (não apenas saldo final). Uma linha por proprietário/competência.

**RentalExpense**: despesas autorizadas/passáveis (água, luz, etc) por competência; isAuthorized flag.

**Inspection (§17.5)**: ENTRY/PERIODIC/EXIT com items checklist e media (fotos).

**MaintenanceRequest + ServiceProvider + Quote + Event (§17.6)**: solicitação → orçamento → aprovação → conclusão.

**Isolamento**: tenant-scoped em todas as entidades.

**Schema**: 14 tabelas novas + relações em Tenant/User/Client/Property. Migration 20260816230000.

**Serviços**: LeasesService (CRUD), ChargesService (cálculo de repasse), InspectionsService, MaintenanceService.

---

## Estado compilação

format ✓ · lint 0 · typecheck 0 · build ✓ · migrate ✓

---

## Próximo

PROMPT E6: empreendimentos, quadras e lotes. Parar lá.
