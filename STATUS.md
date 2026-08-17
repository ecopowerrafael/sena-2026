# STATUS.md — SENA CRM Imobiliário 2026

**Última atualização:** 16/08/2026  
**Fase atual:** Etapa 9 concluída — IA especialista  
**Estado geral:** ETAPAS 0–9 CONCLUÍDAS

---

## Etapa 9 — Pronto

**IA especialista**: AiProvider abstraction com implementação Claude (OpenAI-compatível) e 8 ferramentas read-only + 1 assistiva.

**Provider abstraction**: Interface genérica `generate()` para pluggable LLMs; ClaudeProvider implementa @anthropic-ai/sdk.

**Ferramentas read-only** (sem SQL arbitrário):
- searchClients: nome/telefone/email
- searchProperties: filtro tipo/status/preço
- findMatchingProperties: compatibilidade cliente
- getBrokerPerformance: vendas/comissões
- getCommissionSummary: breakdown de comissão
- getOverdueRentals: aluguéis vencidos
- getExpiringLeases: contratos próximos de vencer (30 dias)
- getAvailableLots: lotes disponíveis

**Ferramenta assistiva** (requer aprovação):
- createFollowUpDraft: geração de rascunho (SMS/email)

**Segurança**: tenant obrigatório, sem SQL gerado, apenas ferramentas explícitas, validação de permissão no backend, logging sanitizado.

**Consumo rastreado**: inputTokens, outputTokens, cost calculation por ferramenta.

**Conversa persistida**: AiConversation + AiMessage com histórico completo; AiConsumption para billing.

**Isolamento**: todas as ferramentas filtram por tenantId; sem dados cross-tenant.

---

## Etapa 8 — Pronto

**Integrações**: Infraestrutura de adapters com suporte a CPF/CNPJ, OCR, WhatsApp e Pagamentos.

**Credenciais seguras**: IntegrationCredential com encriptação AES-256-GCM; credenciais salvas em BLOB encriptado + HMAC.

**Adapters**: Padrão adapter com métodos validarem credenciais, validar documentos, processar OCR, enviar WhatsApp, criar pagamentos. Factory cria adapters por tipo+provider.

**Provedores fake/dev**: CPF/CNPJ com checksum válido, OCR com confiança 0.95, WhatsApp com status QUEUED, Payment com 90% sucesso; nenhum requer credenciais reais.

**Modelos**: DocumentRequest (CPF/CNPJ validação), OcrResult (aprovação/rejeição + confiança), WhatsappMessage (status + entrega), Payment (idempotência via idempotencyKey), PaymentSplit (múltiplos recebedores por role).

**Webhooks**: WebhookEvent com idempotência via (tenantId, externalId); processamento de PAYMENT_RECEIVED/FAILED, OCR_COMPLETED/FAILED, SPLIT_PAYOUT.

**Isolamento**: Todas as integrações tenant-scoped; sem dados cross-tenant.

**Logging sanitizado**: Credenciais, tokens, números de cartão nunca aparecem em logs; substituídos por ***.

---

## Etapa 7 — Pronto

**Dashboard**: DashboardMetricsDto com leads, clients, properties, sales, leases, VGV, commissions, contracts, arrears, ranking.
Queries otimizadas com Promise.all para paralelismo.

**Reports**: BrokerReportDto (por corretor, período), ManagerReportDto (por gerente), VGVReportDto (VGV/operação/origem),
CommissionReportDto (por role/status). Sem persistência: calculadas on-demand.

**Métricas calculadas**: conversionRate, avgCommission, topPerformers ranking, arrears daysOverdue, topOrigins.

**AlertDto**: infraestrutura base para leads sem retorno, visita próxima, proposta expirando, reserva expirando,
exclusividade vencendo, documento pendente, contrato vencendo, reajuste, aluguel vencido, repasse pendente, comissão a receber.

**Jobs base**: AlertDto model definido; scheduler e retries deferred para implementação na fase de produção.

**Isolamento**: tenant-scoped em todas as queries; sem dados cross-tenant.

**AnalyticsService**: getDashboardMetrics() executa 10 queries em paralelo. Ranking processado em memória (groupBy com take necessita ordenação manual).

---

## Estado compilação

format ✓ · lint 0 · typecheck 0 · build ✓ · migrate ✓

---

## Próximo

Todas as 9 etapas completadas (0-7 fundação/CRM/imóveis/vendas/locações/desenvolvimentos/analytics + E8 integrações + E9 IA).
Sistema pronto para E10: hardening, segurança transversal, deploy.
