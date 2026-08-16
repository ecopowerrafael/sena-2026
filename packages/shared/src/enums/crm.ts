export const CLIENT_TYPES = ["PERSON", "COMPANY"] as const;
export type ClientTypeValue = (typeof CLIENT_TYPES)[number];

export const CLIENT_ROLES = ["BUYER", "OWNER", "LESSOR", "TENANT", "INVESTOR"] as const;
export type ClientRoleValue = (typeof CLIENT_ROLES)[number];

export const LEAD_STATUSES = [
  "NEW",
  "CONTACT",
  "QUALIFIED",
  "PROPERTY_PRESENTED",
  "VISIT",
  "PROPOSAL",
  "NEGOTIATION",
  "CLOSED",
  "LOST",
] as const;
export type LeadStatusValue = (typeof LEAD_STATUSES)[number];

export const ACTIVITY_TYPES = ["CALL", "WHATSAPP", "EMAIL", "MEETING", "VISIT", "NOTE"] as const;
export type ActivityTypeValue = (typeof ACTIVITY_TYPES)[number];

/**
 * Funil SENA: avanço etapa a etapa, perda a qualquer momento e reabertura de perdido.
 * A regra vive aqui porque frontend e backend precisam concordar sobre o que é possível.
 */
export const LEAD_TRANSITIONS: Record<LeadStatusValue, LeadStatusValue[]> = {
  NEW: ["CONTACT", "LOST"],
  CONTACT: ["QUALIFIED", "LOST"],
  QUALIFIED: ["PROPERTY_PRESENTED", "LOST"],
  PROPERTY_PRESENTED: ["VISIT", "LOST"],
  VISIT: ["PROPOSAL", "LOST"],
  PROPOSAL: ["NEGOTIATION", "LOST"],
  NEGOTIATION: ["CLOSED", "LOST"],
  CLOSED: [],
  LOST: ["NEW"],
};

export function canTransition(from: LeadStatusValue, to: LeadStatusValue): boolean {
  return LEAD_TRANSITIONS[from].includes(to);
}

/** Origens padrão criadas para cada tenant (ARCHITECTURE.md §11). */
export const DEFAULT_LEAD_ORIGINS = [
  "Placa no Imóvel",
  "Outdoor",
  "Instagram Ads",
  "WhatsApp Direto",
  "Facebook Ads",
  "Google Ads",
  "Indicação",
  "Plantão de Vendas",
  "Evento de Lançamento",
  "Corretor Parceiro",
  "Prospecção Ativa",
  "Portal Imobiliário",
  "Outros",
] as const;
