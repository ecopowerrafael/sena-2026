import type {
  ActivityTypeValue,
  ClientRoleValue,
  ClientTypeValue,
  LeadStatusValue,
} from "../enums/crm";

export interface ClientDto {
  id: string;
  type: ClientTypeValue;
  name: string;
  documentType: "CPF" | "CNPJ" | null;
  /** Somente máscara com os últimos dígitos: o documento nunca trafega em claro. */
  documentMasked: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  roles: ClientRoleValue[];
  responsibleBrokerId: string | null;
  responsibleBrokerName: string | null;
  lastContactAt: string | null;
  nextContactAt: string | null;
  notes: string | null;
  createdAt: string;
}

export interface LeadDto {
  id: string;
  status: LeadStatusValue;
  lostReason: string | null;
  estimatedBudget: number | null;
  originId: string;
  originName: string;
  campaignId: string | null;
  campaignName: string | null;
  assignedBrokerId: string;
  assignedBrokerName: string;
  client: ClientDto;
  lastContactAt: string | null;
  nextContactAt: string | null;
  notes: string | null;
  createdAt: string;
}

export interface LeadStatusHistoryDto {
  id: string;
  fromStatus: LeadStatusValue | null;
  toStatus: LeadStatusValue;
  reason: string | null;
  changedByName: string | null;
  createdAt: string;
}

export interface ActivityDto {
  id: string;
  type: ActivityTypeValue;
  description: string;
  occurredAt: string;
  clientId: string | null;
  leadId: string | null;
  createdByName: string | null;
}

export interface LeadOriginDto {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface CampaignDto {
  id: string;
  name: string;
  originId: string | null;
  isActive: boolean;
}

export interface BrokerDto {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "BROKER" | "PLATFORM_ADMIN";
  status: "ACTIVE" | "INACTIVE";
  creci: string | null;
  phone: string | null;
  whatsapp: string | null;
  teamId: string | null;
  teamName: string | null;
  managerUserId: string | null;
  managerName: string | null;
  avatarUrl: string | null;
  leadsCount: number;
}
