export interface DevelopmentDto {
  id: string;
  name: string;
  developerCompany: string | null;
  location: string;
  launchDate: string;
  deliveryForecast: string | null;
  commissionPercentage: number;
  campaignId: string | null;
  status: string;
  heroAssetId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DevelopmentBlockDto {
  id: string;
  developmentId: string;
  code: string;
  name: string;
  sortOrder: number;
  createdAt: string;
}

export interface LotDto {
  id: string;
  developmentId: string;
  blockId: string;
  lotNumber: string;
  areaM2: number;
  basePrice: number;
  promotionalPrice: number | null;
  minDownPayment: number;
  maxInstallments: number;
  status: "AVAILABLE" | "RESERVED" | "PROPOSAL" | "SOLD" | "BLOCKED" | "CANCELLATION";
  createdAt: string;
  updatedAt: string;
}

export interface LotReservationDto {
  id: string;
  lotId: string;
  clientId: string;
  brokerId: string;
  reservedAt: string;
  expiresAt: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "CONVERTED_TO_PROPOSAL";
  createdAt: string;
}

export interface LotSimulationDto {
  id: string;
  lotId: string;
  clientId: string | null;
  brokerId: string;
  entryAmount: number;
  installments: number;
  discountAmount: number;
  financedBalance: number;
  interestRate: number | null;
  installmentValue: number;
  createdAt: string;
}

export interface LotProposalDto {
  id: string;
  developmentId: string;
  lotId: string;
  clientId: string;
  brokerId: string;
  proposedPrice: number;
  entryAmount: number;
  installments: number;
  interestRate: number | null;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "APPROVED" | "CANCELLED";
  proposedAt: string;
  expiresAt: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LotSaleDto {
  id: string;
  developmentId: string;
  lotId: string;
  proposalId: string;
  clientId: string;
  brokerId: string;
  finalPrice: number;
  entryAmount: number;
  installments: number;
  interestRate: number | null;
  contractNumber: string | null;
  saleDate: string;
  createdAt: string;
  updatedAt: string;
}
