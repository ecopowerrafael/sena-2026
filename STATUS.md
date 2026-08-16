# STATUS.md — SENA CRM Imobiliário 2026

**Última atualização:** 16/08/2026  
**Fase atual:** Etapa 3 concluída — imóveis, proprietários e interesse  
**Estado geral:** ETAPAS 0–3 CONCLUÍDAS / ETAPA 4 (VISITAS, VENDAS, COMISSÕES) PENDENTE

---

## Etapa 3 — Pronto

**Property (ARCHITECTURE.md §13)**: código único/tenant, tipo (9 tipos), propósito (SALE/RENT/BOTH),
captador, preços (venda/aluguel), condomínio, IPTU, endereço brasileiro (logradouro/número/complemento/bairro/
cidade/estado/CEP/geo), área (total/privada), quartos/suítes/banhos/garagens, status de documentação,
exclusividade com vencimento, descrição.

**PropertyOwner (§13.1)**: múltiplos proprietários por imóvel, percentual, isPrimary.

**Assets + Mídia (§13.2)**: referência a binários (LOCAL/S3), não em MySQL. Asset (kind/provider/path/
mimeType/size/checksum). PropertyMedia (tipo: PHOTO/VIDEO/DOCUMENT, sortOrder).

**PropertyFeature**: características (piscina, churrasqueira, etc).

**InterestProfile (§12)**: objetivo (BUY/RENT), preço (mín/máx), quartos/suítes/garagens (mín),
método de pagamento (array JSON), financiamento, bairros preferidos, notas.

**Matching**: score calculado (não persistido), razões de compatibilidade (preço/bairro/quartos/
financiamento).

**Isolamento**: tenant-scoped em property/media/features/owners.

**Schema**: 7 tabelas novas + relações em Tenant/User/Client. Migration 20260816210000.

---

## Estado compilação

format ✓ · lint 0 · typecheck 3/3 ✓ · build ✓ · migrate ✓

---

## Próximo

PROMPT E4: visitas, propostas, vendas e comissões. Parar lá.
