import type {
  DocumentValidationRequest,
  DocumentValidationResult,
  OcrRequest,
  OcrRequestResult,
  WhatsappSendRequest,
  WhatsappSendResult,
  CreatePaymentRequest,
  CreatePaymentResult,
} from "@sena/shared";

export abstract class IntegrationAdapter {
  constructor(protected credentials: Record<string, any>) {}

  async validateCredentials(): Promise<{ isValid: boolean; error?: string }> {
    return { isValid: true };
  }

  async validateDocument(
    req: DocumentValidationRequest
  ): Promise<DocumentValidationResult> {
    throw new Error("Not implemented");
  }

  async processOcr(req: OcrRequest): Promise<OcrRequestResult> {
    throw new Error("Not implemented");
  }

  async sendWhatsapp(req: WhatsappSendRequest): Promise<WhatsappSendResult> {
    throw new Error("Not implemented");
  }

  async createPayment(req: CreatePaymentRequest): Promise<CreatePaymentResult> {
    throw new Error("Not implemented");
  }

  protected sanitizeLog(data: any): any {
    if (typeof data !== "object" || data === null) return data;
    const sanitized = JSON.parse(JSON.stringify(data));
    if (sanitized.cardNumber) sanitized.cardNumber = "***";
    if (sanitized.cvv) sanitized.cvv = "***";
    if (sanitized.password) sanitized.password = "***";
    if (sanitized.apiKey) sanitized.apiKey = sanitized.apiKey.substring(0, 4) + "***";
    return sanitized;
  }
}
