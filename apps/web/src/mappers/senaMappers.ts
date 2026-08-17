import type { LeadDto, BrokerDto } from "@sena/shared";
import type { Lead, Broker, LeadOrigin } from "../types/senaCrm";

/**
 * Maps backend LeadStatusValue to frontend LeadStatus
 */
function mapLeadStatus(backendStatus: string): string {
  const statusMap: Record<string, string> = {
    NEW: "novo",
    CONTACT: "contato",
    QUALIFIED: "qualificado",
    PROPERTY_PRESENTED: "apresentado",
    VISIT: "visita",
    PROPOSAL: "proposta",
    NEGOTIATION: "negociacao",
    CLOSED: "fechado",
    LOST: "perdido",
  };
  return statusMap[backendStatus] || "novo";
}

/**
 * Maps frontend LeadStatus to backend LeadStatusValue
 */
function mapLeadStatusToBackend(frontendStatus: string): string {
  const statusMap: Record<string, string> = {
    novo: "NEW",
    contato: "CONTACT",
    qualificado: "QUALIFIED",
    apresentado: "PROPERTY_PRESENTED",
    visita: "VISIT",
    proposta: "PROPOSAL",
    negociacao: "NEGOTIATION",
    fechado: "CLOSED",
    perdido: "LOST",
  };
  return statusMap[frontendStatus] || "NEW";
}

/**
 * Converts backend LeadDto to frontend Lead type
 */
export function mapLeadDtoToLead(dto: LeadDto): Lead {
  return {
    id: dto.id,
    name: dto.client.name,
    document: dto.client.documentMasked || "000.000.000-00",
    phone: dto.client.phone || "(11) 90000-0000",
    whatsapp: dto.client.whatsapp || (dto.client.phone || "5511900000000").replace(/\D/g, ""),
    email: dto.client.email || "cliente@email.com",
    type: mapClientType(dto.client.type, dto.client.roles),
    brokerId: dto.assignedBrokerId,
    brokerName: dto.assignedBrokerName,
    origin: dto.originName as LeadOrigin,
    campaign: dto.campaignName || undefined,
    status: mapLeadStatus(dto.status) as any,
    lostReason: dto.lostReason || undefined,
    createdAt: dto.createdAt.split("T")[0],
    lastContact: dto.lastContactAt?.split("T")[0] || new Date().toISOString().split("T")[0],
    nextContact: dto.nextContactAt?.split("T")[0],
    estimatedBudget: dto.estimatedBudget || 2000000,
    notes: dto.notes || "Lead sincronizado da API.",
  };
}

/**
 * Converts frontend Lead to backend LeadStatusValue for PATCH requests
 */
export function mapLeadToUpdatePayload(
  lead: Lead,
  newStatus: string,
  lostReason?: string
): { status: string; reason?: string } {
  return {
    status: mapLeadStatusToBackend(newStatus),
    ...(lostReason && { reason: lostReason }),
  };
}

/**
 * Maps client type and roles to determine lead type
 */
function mapClientType(backendType: string, roles?: string[]): "comprador" | "proprietario" | "locador" | "locatario" | "investidor" {
  if (roles && roles.length > 0) {
    const roleMap: Record<string, "comprador" | "proprietario" | "locador" | "locatario" | "investidor"> = {
      BUYER: "comprador",
      OWNER: "proprietario",
      LESSOR: "locador",
      TENANT: "locatario",
      INVESTOR: "investidor",
    };
    for (const role of roles) {
      if (roleMap[role]) return roleMap[role];
    }
  }
  const typeMap: Record<string, "comprador" | "proprietario" | "locador" | "locatario" | "investidor"> = {
    PERSON: "comprador",
    BUYER: "comprador",
    OWNER: "proprietario",
    LESSOR: "locador",
    TENANT: "locatario",
    INVESTOR: "investidor",
    COMPANY: "comprador",
  };
  return typeMap[backendType] || "comprador";
}

/**
 * Converts backend BrokerDto to frontend Broker type
 */
export function mapBrokerDtoToBroker(dto: BrokerDto): Broker {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    phone: dto.phone || "(11) 98888-0000",
    creci: dto.creci || "CRECI 000.000-F",
    avatar:
      dto.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    managerName: dto.managerName || "Carlos Eduardo Sena",
    team: dto.teamName || "Equipe Alpha — Alto Padrão",
    status: dto.status === "ACTIVE" ? "Ativo" : "Inativo",
    leadsCount: dto.leadsCount,
    salesCount: 0,
    rentalsCount: 0,
    vgvTotal: 0,
    commissionEarned: 0,
    conversionRate: 0,
  };
}
