export interface LeaseDto {
  id: string;
  contractNumber: string;
  propertyId: string;
  responsibleBrokerId: string | null;
  monthlyRent: number;
  condoFee: number | null;
  iptuFee: number | null;
  startDate: string;
  endDate: string;
  dueDay: number;
  guaranteeType: string;
  adminFeePercentage: number;
  adjustmentIndex: string | null;
  nextAdjustmentDate: string | null;
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "TERMINATED";
  createdAt: string;
  updatedAt: string;
}

export interface RentChargeDto {
  id: string;
  leaseId: string;
  competence: string;
  dueDate: string;
  rentAmount: number;
  condoAmount: number;
  iptuAmount: number;
  otherAmount: number;
  discountAmount: number;
  fineAmount: number;
  interestAmount: number;
  totalAmount: number;
  status: "PENDING" | "PARTIAL" | "PAID" | "OVERDUE" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
}

export interface RentPaymentDto {
  id: string;
  chargeId: string;
  amount: number;
  paymentDate: string;
  receiptUrl: string | null;
  notes: string | null;
  createdAt: string;
}

export interface OwnerPayoutDto {
  id: string;
  leaseId: string;
  competence: string;
  ownerClientId: string;
  rentAmount: number;
  adminFeeAmount: number;
  expensesAmount: number;
  netAmount: number;
  payoutDate: string | null;
  payoutReceiptUrl: string | null;
  notes: string | null;
  createdAt: string;
}

export interface RentalExpenseDto {
  id: string;
  leaseId: string;
  competence: string;
  description: string;
  amount: number;
  isAuthorized: boolean;
  createdAt: string;
  authorizedAt: string | null;
}

export interface InspectionDto {
  id: string;
  leaseId: string;
  inspectionType: "ENTRY" | "PERIODIC" | "EXIT";
  inspectorName: string | null;
  notes: string | null;
  inspectedAt: string;
  items: InspectionItemDto[];
  media: InspectionMediaDto[];
  createdAt: string;
}

export interface InspectionItemDto {
  id: string;
  inspectionId: string;
  description: string;
  status: string;
  notes: string | null;
  createdAt: string;
}

export interface InspectionMediaDto {
  id: string;
  inspectionId: string;
  url: string;
  mimeType: string;
  uploadedAt: string;
}

export interface MaintenanceRequestDto {
  id: string;
  leaseId: string;
  description: string;
  status: "REQUESTED" | "QUOTED" | "APPROVED" | "COMPLETED" | "CANCELLED";
  requestedAt: string;
  completedAt: string | null;
  createdAt: string;
}

export interface ServiceProviderDto {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  category: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface MaintenanceQuoteDto {
  id: string;
  requestId: string;
  providerId: string;
  description: string;
  amount: number;
  dueDate: string | null;
  isApproved: boolean;
  createdAt: string;
  approvedAt: string | null;
}

export interface MaintenanceEventDto {
  id: string;
  requestId: string;
  providerId: string;
  description: string;
  amount: number;
  completedAt: string;
  invoiceUrl: string | null;
  createdAt: string;
}
