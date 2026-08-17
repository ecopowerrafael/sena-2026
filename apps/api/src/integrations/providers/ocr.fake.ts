import { IntegrationAdapter } from "../integration-adapter";
import type { OcrRequest, OcrRequestResult } from "@sena/shared";

export class OcrFakeProvider extends IntegrationAdapter {
  async validateCredentials() {
    return { isValid: true };
  }

  async processOcr(req: OcrRequest): Promise<OcrRequestResult> {
    // Simulação de OCR - extrai metadados fake do URL
    const result: OcrRequestResult = {
      extractedText: `Documento ID: ${Math.random().toString(36).substring(7)}\nData: ${new Date().toLocaleDateString("pt-BR")}\nStatus: Válido`,
      extractedData: {
        documentType: req.documentType,
        documentNumber: `000.000.000-${Math.floor(Math.random() * 100)}`,
        holderName: "Pessoa Identificada",
        issuanceDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      },
      confidence: 0.95,
    };

    return result;
  }
}
