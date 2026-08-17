import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { CryptoService } from "../common/crypto.service";
import { AdapterFactory } from "./adapter-factory";
import { WebhookService } from "./webhook.service";
import type { AuthContext } from "../auth/auth.types";
import type {
  IntegrationCredentialDto,
  DocumentValidationRequest,
  DocumentValidationResult,
  OcrRequest,
  OcrRequestResult,
  WhatsappSendRequest,
  WhatsappSendResult,
  CreatePaymentRequest,
  CreatePaymentResult,
  PaymentDto,
  PaymentSplitDto,
  DocumentRequestDto,
  OcrResultDto,
  WhatsappMessageDto,
} from "@sena/shared";
import { createHash } from "node:crypto";

@Injectable()
export class IntegrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
    private readonly adapterFactory: AdapterFactory,
    private readonly webhookService: WebhookService
  ) {}

  // ---- Credentials Management ----

  async setupCredential(
    auth: AuthContext,
    type: any,
    providerName: string,
    credentials: Record<string, any>
  ): Promise<IntegrationCredentialDto> {
    const adapter = this.adapterFactory.createAdapter(type, providerName, credentials);

    // Valida credenciais
    const validation = await adapter.validateCredentials();
    if (!validation.isValid) {
      throw new BadRequestException(
        `Credential validation failed: ${validation.error}`
      );
    }

    // Encripta credenciais
    const encrypted = this.cryptoService.encrypt(
      JSON.stringify(credentials)
    );
    const hash = createHash("sha256").update(encrypted).digest("hex");

    // Salva ou atualiza
    const existing = await this.prisma.integrationCredential.findFirst({
      where: {
        tenantId: auth.tenantId,
        type,
        providerName,
      },
    });

    let result;
    if (existing) {
      result = await this.prisma.integrationCredential.update({
        where: { id: existing.id },
        data: {
          credentialEncrypted: encrypted,
          credentialHash: hash,
          lastValidated: new Date(),
          validationError: null,
        },
      });
    } else {
      result = await this.prisma.integrationCredential.create({
        data: {
          tenantId: auth.tenantId,
          type,
          providerName,
          credentialEncrypted: encrypted,
          credentialHash: hash,
          lastValidated: new Date(),
        },
      });
    }

    return this.mapCredentialDto(result);
  }

  async getCredential(
    tenantId: string,
    type: any,
    providerName: string
  ): Promise<Record<string, any>> {
    const cred = await this.prisma.integrationCredential.findFirst({
      where: {
        tenantId,
        type,
        providerName,
        isActive: true,
      },
    });

    if (!cred) {
      throw new NotFoundException("Integration credential not found");
    }

    const decrypted = this.cryptoService.decrypt(
      cred.credentialEncrypted
    );
    return JSON.parse(decrypted);
  }

  // ---- Document Validation ----

  async validateDocument(
    auth: AuthContext,
    clientId: string,
    req: DocumentValidationRequest
  ): Promise<DocumentRequestDto> {
    const creds = await this.getCredential(
      auth.tenantId,
      "DOCUMENT_VALIDATION" as any,
      "fake"
    );
    const adapter = this.adapterFactory.createAdapter(
      "DOCUMENT_VALIDATION" as any,
      "fake",
      creds
    );

    const result = await adapter.validateDocument(req);

    // Hash do documento
    const docHash = createHash("sha256")
      .update(req.documentNumber)
      .digest("hex");

    const docReq = await this.prisma.documentRequest.create({
      data: {
        tenantId: auth.tenantId,
        clientId,
        documentType: req.documentType,
        documentHash: docHash,
        resultStatus: result.status,
        resultData: result as any,
        validatedAt: new Date(),
      },
    });

    return this.mapDocumentRequestDto(docReq);
  }

  // ---- OCR ----

  async requestOcr(
    auth: AuthContext,
    clientId: string | null,
    req: OcrRequest
  ): Promise<OcrResultDto> {
    const creds = await this.getCredential(auth.tenantId, "OCR" as any, "fake");
    const adapter = this.adapterFactory.createAdapter("OCR" as any, "fake", creds);

    const ocrResult = await adapter.processOcr(req);

    // Hash do documento
    const docHash = createHash("sha256")
      .update(req.fileUrl)
      .digest("hex");

    const result = await this.prisma.ocrResult.create({
      data: {
        tenantId: auth.tenantId,
        clientId,
        documentHash: docHash,
        extractedText: ocrResult.extractedText,
        extractedData: ocrResult.extractedData as any,
        confidence: ocrResult.confidence || null,
      },
    });

    return this.mapOcrResultDto(result);
  }

  async approveOcrResult(
    auth: AuthContext,
    ocrResultId: string
  ): Promise<OcrResultDto> {
    const result = await this.prisma.ocrResult.update({
      where: { id: ocrResultId },
      data: {
        approvedAt: new Date(),
        reviewedByUserId: auth.userId,
        reviewedAt: new Date(),
      },
    });

    return this.mapOcrResultDto(result);
  }

  async rejectOcrResult(
    auth: AuthContext,
    ocrResultId: string,
    reason: string
  ): Promise<OcrResultDto> {
    const result = await this.prisma.ocrResult.update({
      where: { id: ocrResultId },
      data: {
        rejectedAt: new Date(),
        rejectionReason: reason,
        reviewedByUserId: auth.userId,
        reviewedAt: new Date(),
      },
    });

    return this.mapOcrResultDto(result);
  }

  // ---- WhatsApp ----

  async sendWhatsapp(
    auth: AuthContext,
    req: WhatsappSendRequest
  ): Promise<WhatsappMessageDto> {
    const creds = await this.getCredential(auth.tenantId, "WHATSAPP" as any, "fake");
    const adapter = this.adapterFactory.createAdapter(
      "WHATSAPP" as any,
      "fake",
      creds
    );

    const sendResult = await adapter.sendWhatsapp(req);

    const msg = await this.prisma.whatsappMessage.create({
      data: {
        tenantId: auth.tenantId,
        recipientPhone: req.phone,
        messageBody: req.message,
        templateName: req.template || null,
        externalId: sendResult.messageId,
        status: sendResult.status,
      },
    });

    return this.mapWhatsappMessageDto(msg);
  }

  // ---- Payments ----

  async createPayment(
    auth: AuthContext,
    req: CreatePaymentRequest
  ): Promise<PaymentDto> {
    // Verifica idempotência
    if (req.idempotencyKey) {
      const existing = await this.prisma.payment.findFirst({
        where: {
          tenantId: auth.tenantId,
          idempotencyKey: req.idempotencyKey,
        },
      });

      if (existing) {
        return this.mapPaymentDto(existing);
      }
    }

    const creds = await this.getCredential(auth.tenantId, "PAYMENT" as any, "fake");
    const adapter = this.adapterFactory.createAdapter("PAYMENT" as any, "fake", creds);

    const result = await adapter.createPayment(req);

    const payment = await this.prisma.payment.create({
      data: {
        tenantId: auth.tenantId,
        externalId: result.externalId || null,
        amount: req.amount,
        currency: req.currency,
        status: result.status,
        paymentMethod: req.paymentMethod,
        cardLast4: req.cardToken ? req.cardToken.slice(-4) : null,
        failureReason: result.message || null,
        idempotencyKey: req.idempotencyKey,
      },
    });

    return this.mapPaymentDto(payment);
  }

  async createPaymentSplit(
    auth: AuthContext,
    paymentId: string,
    recipientRole: any,
    recipientUserId: string | null,
    amount: number,
    percentage: number
  ): Promise<PaymentSplitDto> {
    const split = await this.prisma.paymentSplit.create({
      data: {
        tenantId: auth.tenantId,
        paymentId,
        recipientRole,
        recipientUserId,
        amount,
        percentage,
        status: "PENDING",
      },
    });

    return this.mapPaymentSplitDto(split);
  }

  async processWebhook(
    tenantId: string,
    type: any,
    externalId: string,
    payload: any
  ): Promise<void> {
    await this.webhookService.processWebhook(tenantId, type, externalId, payload);
  }

  // ---- Mappers ----

  private mapCredentialDto(cred: any): IntegrationCredentialDto {
    return {
      id: cred.id,
      type: cred.type,
      providerName: cred.providerName,
      isActive: cred.isActive,
      lastValidated: cred.lastValidated,
      validationError: cred.validationError,
      createdAt: cred.createdAt,
    };
  }

  private mapDocumentRequestDto(req: any): DocumentRequestDto {
    return {
      id: req.id,
      clientId: req.clientId,
      documentType: req.documentType,
      resultStatus: req.resultStatus,
      resultData: req.resultData as any,
      validatedAt: req.validatedAt,
      auditedByUserId: req.auditedByUserId,
      auditedAt: req.auditedAt,
      createdAt: req.createdAt,
    };
  }

  private mapOcrResultDto(result: any): OcrResultDto {
    return {
      id: result.id,
      clientId: result.clientId,
      extractedText: result.extractedText,
      extractedData: result.extractedData as any,
      confidence: result.confidence ? Number(result.confidence) : null,
      reviewedByUserId: result.reviewedByUserId,
      reviewedAt: result.reviewedAt,
      approvedAt: result.approvedAt,
      rejectedAt: result.rejectedAt,
      rejectionReason: result.rejectionReason,
      createdAt: result.createdAt,
    };
  }

  private mapWhatsappMessageDto(msg: any): WhatsappMessageDto {
    return {
      id: msg.id,
      recipientPhone: msg.recipientPhone,
      messageBody: msg.messageBody,
      templateName: msg.templateName,
      externalId: msg.externalId,
      status: msg.status,
      deliveredAt: msg.deliveredAt,
      readAt: msg.readAt,
      failureReason: msg.failureReason,
      createdAt: msg.createdAt,
    };
  }

  private mapPaymentDto(payment: any): PaymentDto {
    return {
      id: payment.id,
      externalId: payment.externalId,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      cardLast4: payment.cardLast4,
      cardBrand: payment.cardBrand,
      authorizedAt: payment.authorizedAt,
      capturedAt: payment.capturedAt,
      failedAt: payment.failedAt,
      failureReason: payment.failureReason,
      idempotencyKey: payment.idempotencyKey,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }

  private mapPaymentSplitDto(split: any): PaymentSplitDto {
    return {
      id: split.id,
      paymentId: split.paymentId,
      recipientRole: split.recipientRole,
      recipientUserId: split.recipientUserId,
      amount: Number(split.amount),
      percentage: Number(split.percentage),
      status: split.status,
      paidAt: split.paidAt,
      createdAt: split.createdAt,
    };
  }
}
