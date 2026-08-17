export enum IntegrationType {
  DOCUMENT_VALIDATION = "DOCUMENT_VALIDATION",
  OCR = "OCR",
  WHATSAPP = "WHATSAPP",
  PAYMENT = "PAYMENT",
  SPLIT = "SPLIT",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  AUTHORIZED = "AUTHORIZED",
  CAPTURED = "CAPTURED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  CANCELLED = "CANCELLED",
}

export enum SplitRecipientRole {
  AGENCY = "AGENCY",
  MANAGER = "MANAGER",
  CAPTATOR = "CAPTATOR",
  BROKER = "BROKER",
  PARTNER = "PARTNER",
}

export interface IntegrationCredentialDto {
  id: string;
  type: IntegrationType;
  providerName: string;
  isActive: boolean;
  lastValidated: Date | null;
  validationError: string | null;
  createdAt: Date;
}

export interface PaymentDto {
  id: string;
  externalId: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  cardLast4: string | null;
  cardBrand: string | null;
  authorizedAt: Date | null;
  capturedAt: Date | null;
  failedAt: Date | null;
  failureReason: string | null;
  idempotencyKey: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentSplitDto {
  id: string;
  paymentId: string;
  recipientRole: SplitRecipientRole;
  recipientUserId: string | null;
  amount: number;
  percentage: number;
  status: string;
  paidAt: Date | null;
  createdAt: Date;
}

export interface DocumentRequestDto {
  id: string;
  clientId: string;
  documentType: string;
  resultStatus: string | null;
  resultData: Record<string, any> | null;
  validatedAt: Date | null;
  auditedByUserId: string | null;
  auditedAt: Date | null;
  createdAt: Date;
}

export interface OcrResultDto {
  id: string;
  clientId: string | null;
  extractedText: string;
  extractedData: Record<string, any>;
  confidence: number | null;
  reviewedByUserId: string | null;
  reviewedAt: Date | null;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
}

export interface WhatsappMessageDto {
  id: string;
  recipientPhone: string;
  messageBody: string;
  templateName: string | null;
  externalId: string | null;
  status: string;
  deliveredAt: Date | null;
  readAt: Date | null;
  failureReason: string | null;
  createdAt: Date;
}

export interface DocumentValidationRequest {
  documentNumber: string;
  documentType: "CPF" | "CNPJ";
}

export interface DocumentValidationResult {
  isValid: boolean;
  name: string;
  documentNumber: string;
  documentType: string;
  status: string;
  validationDate: string;
}

export interface OcrRequest {
  fileUrl: string;
  documentType: string;
}

export interface OcrRequestResult {
  extractedText: string;
  extractedData: Record<string, any>;
  confidence?: number;
}

export interface WhatsappSendRequest {
  phone: string;
  message: string;
  template?: string;
  variables?: Record<string, string>;
}

export interface WhatsappSendResult {
  messageId: string;
  status: string;
  timestamp: string;
}

export interface CreatePaymentRequest {
  amount: number;
  currency: string;
  paymentMethod: string;
  cardToken?: string;
  idempotencyKey: string;
}

export interface CreatePaymentResult {
  paymentId: string;
  externalId?: string;
  status: PaymentStatus;
  message?: string;
}

export interface WebhookPayload {
  eventType: string;
  timestamp: string;
  data: Record<string, any>;
}
