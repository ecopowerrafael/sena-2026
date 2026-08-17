import { IntegrationAdapter } from "../integration-adapter";
import type { WhatsappSendRequest, WhatsappSendResult } from "@sena/shared";

export class WhatsappFakeProvider extends IntegrationAdapter {
  async validateCredentials() {
    return { isValid: true };
  }

  async sendWhatsapp(req: WhatsappSendRequest): Promise<WhatsappSendResult> {
    // Simulação: gera messageId fake e marca como "QUEUED"
    const messageId = `wa_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Log sanitizado (sem dados sensíveis)
    console.log(`[WhatsApp] Message queued: ${messageId} to ${req.phone.substring(0, 3)}***`);

    return {
      messageId,
      status: "QUEUED",
      timestamp: new Date().toISOString(),
    };
  }
}
