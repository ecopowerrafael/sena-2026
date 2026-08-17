import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private readonly prisma: PrismaService) {}

  async processWebhook(
    tenantId: string,
    eventType: any,
    externalId: string,
    payload: any
  ): Promise<void> {
    // Tenta processar webhook com idempotência (upsert retorna se já existe)
    const existing = await this.prisma.webhookEvent.findUnique({
      where: { tenantId_externalId: { tenantId, externalId } },
    });

    if (existing?.processed) {
      this.logger.debug(
        `Webhook already processed: ${externalId}, skipping...`
      );
      return;
    }

    let processError: string | null = null;

    try {
      await this.handleEvent(tenantId, eventType, payload);
    } catch (err) {
      processError = String(err);
      this.logger.error(
        `Webhook processing failed: ${this.sanitizeLog(err)}`
      );
    }

    // Marca como processado (sucesso ou erro)
    if (existing) {
      await this.prisma.webhookEvent.update({
        where: { id: existing.id },
        data: {
          processed: true,
          processedAt: new Date(),
          processError,
        },
      });
    } else {
      await this.prisma.webhookEvent.create({
        data: {
          tenantId,
          type: eventType,
          externalId,
          payload,
          processed: processError === null,
          processedAt: new Date(),
          processError,
        },
      });
    }
  }

  private async handleEvent(
    tenantId: string,
    eventType: any,
    payload: any
  ): Promise<void> {
    switch (eventType) {
      case "PAYMENT_RECEIVED":
        await this.handlePaymentReceived(tenantId, payload);
        break;
      case "PAYMENT_FAILED":
        await this.handlePaymentFailed(tenantId, payload);
        break;
      case "SPLIT_PAYOUT":
        await this.handleSplitPayout(tenantId, payload);
        break;
      case "OCR_COMPLETED":
        // Log para revisão humana
        this.logger.log(`OCR completed: ${this.sanitizeLog(payload.data)}`);
        break;
      case "OCR_FAILED":
        this.logger.error(`OCR failed: ${this.sanitizeLog(payload.data)}`);
        break;
    }
  }

  private async handlePaymentReceived(
    tenantId: string,
    payload: any
  ): Promise<void> {
    const { paymentId } = payload.data as { paymentId: string };

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: "CAPTURED", capturedAt: new Date() },
    });

    this.logger.log(`Payment captured: ${paymentId}`);
  }

  private async handlePaymentFailed(
    tenantId: string,
    payload: any
  ): Promise<void> {
    const { paymentId, reason } = payload.data as {
      paymentId: string;
      reason: string;
    };

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "FAILED",
        failedAt: new Date(),
        failureReason: reason,
      },
    });

    this.logger.error(`Payment failed: ${paymentId} - ${reason}`);
  }

  private async handleSplitPayout(
    tenantId: string,
    payload: any
  ): Promise<void> {
    const { splitId } = payload.data as { splitId: string };

    await this.prisma.paymentSplit.update({
      where: { id: splitId },
      data: { status: "PAID", paidAt: new Date() },
    });

    this.logger.log(`Split payout processed: ${splitId}`);
  }

  private sanitizeLog(data: any): string {
    if (typeof data === "string") return data;
    const sanitized = JSON.parse(JSON.stringify(data));
    if (sanitized.cardNumber) sanitized.cardNumber = "***";
    if (sanitized.cvv) sanitized.cvv = "***";
    if (sanitized.apiKey) sanitized.apiKey = sanitized.apiKey.substring(0, 4) + "***";
    return JSON.stringify(sanitized);
  }
}
