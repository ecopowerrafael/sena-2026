export interface VisitDto {
  id: string;
  propertyId: string;
  clientId: string;
  brokerId: string;
  scheduledAt: string;
  durationMinutes: number | null;
  feedback: string | null;
  impression: string | null;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  createdAt: string;
}

export interface ProposalDto {
  id: string;
  code: string;
  propertyId: string;
  clientId: string;
  brokerId: string;
  advertisedPrice: number;
  proposedPrice: number;
  downPayment: number | null;
  installmentsCount: number | null;
  installmentsValue: number | null;
  paymentMethod: string;
  paymentDescription: string | null;
  counterProposalPrice: number | null;
  counterProposalNotes: string | null;
  status: "DRAFT" | "SUBMITTED" | "COUNTER_PROPOSED" | "APPROVED" | "REJECTED" | "EXPIRED";
  createdAt: string;
  updatedAt: string;
}

export interface SaleDto {
  id: string;
  code: string;
  propertyId: string;
  buyerClientId: string;
  brokerId: string;
  captatorBrokerId: string | null;
  proposalId: string | null;
  finalSalePrice: number;
  saleDate: string;
  paymentType: string;
  contractNumber: string | null;
  documentationStatus: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
}

export interface CommissionSplitDto {
  id: string;
  commissionId: string;
  recipientType: string;
  recipientId: string | null;
  recipientName: string | null;
  percentage: number;
  amount: number;
  status: "PENDING" | "EXPECTED" | "RECEIVED" | "SETTLED" | "CANCELLED";
  paidAt: string | null;
}

export interface CommissionDto {
  id: string;
  saleId: string | null;
  baseValue: number;
  totalPercentage: number;
  totalValue: number;
  status: "PENDING" | "EXPECTED" | "RECEIVED" | "SETTLED" | "CANCELLED";
  expectedAt: string | null;
  receivedAt: string | null;
  settledAt: string | null;
  splits: CommissionSplitDto[];
  createdAt: string;
}
