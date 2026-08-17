import { Injectable } from "@nestjs/common";
import { IntegrationType } from "@sena/shared";
import { IntegrationAdapter } from "./integration-adapter";
import { DocumentValidationFakeProvider } from "./providers/document-validation.fake";
import { OcrFakeProvider } from "./providers/ocr.fake";
import { WhatsappFakeProvider } from "./providers/whatsapp.fake";
import { PaymentFakeProvider } from "./providers/payment.fake";

@Injectable()
export class AdapterFactory {
  createAdapter(
    type: IntegrationType,
    providerName: string,
    credentials: Record<string, any>
  ): IntegrationAdapter {
    // Fake/dev providers (sem credenciais reais necessárias)
    if (providerName === "fake" || providerName === "dev") {
      switch (type) {
        case IntegrationType.DOCUMENT_VALIDATION:
          return new DocumentValidationFakeProvider(credentials);
        case IntegrationType.OCR:
          return new OcrFakeProvider(credentials);
        case IntegrationType.WHATSAPP:
          return new WhatsappFakeProvider(credentials);
        case IntegrationType.PAYMENT:
          return new PaymentFakeProvider(credentials);
        default:
          throw new Error(`Unsupported integration type: ${type}`);
      }
    }

    // Placeholder para provedores reais (a implementar com credenciais reais)
    throw new Error(`Provider ${providerName} not implemented. Use 'fake' or 'dev' for testing.`);
  }
}
