import { IntegrationAdapter } from "../integration-adapter";
import type { CreatePaymentRequest, CreatePaymentResult } from "@sena/shared";
import { PaymentStatus } from "@sena/shared";

export class PaymentFakeProvider extends IntegrationAdapter {
  async validateCredentials() {
    return { isValid: true };
  }

  async createPayment(req: CreatePaymentRequest): Promise<CreatePaymentResult> {
    // Simulação: 90% sucesso, 10% falha
    const isSuccess = Math.random() < 0.9;
    const paymentId = `pm_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const externalId = `ext_${Math.random().toString(36).substring(7)}`;

    if (isSuccess) {
      return {
        paymentId,
        externalId,
        status: PaymentStatus.AUTHORIZED,
        message: "Payment authorized successfully",
      };
    } else {
      return {
        paymentId,
        status: PaymentStatus.FAILED,
        message: "Insufficient funds",
      };
    }
  }
}
