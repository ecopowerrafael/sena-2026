import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Auth } from "../auth/decorators";
import type { AuthContext } from "../auth/auth.types";
import { IntegrationsService } from "./integrations.service";
import {
  SetupIntegrationCredentialDto,
  CreatePaymentDto,
  CreatePaymentSplitDto,
  ValidateDocumentDto,
  RequestOcrDto,
  SendWhatsappDto,
  ApproveOcrResultDto,
  RejectOcrResultDto,
} from "./integrations.dto";
import type {
  IntegrationCredentialDto,
  PaymentDto,
  PaymentSplitDto,
  DocumentRequestDto,
  OcrResultDto,
  WhatsappMessageDto,
} from "@sena/shared";

@Controller("integrations")
@UseGuards(JwtAuthGuard)
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post("credentials/setup")
  @HttpCode(201)
  async setupCredential(
    @Auth() auth: AuthContext,
    @Body() dto: SetupIntegrationCredentialDto
  ): Promise<IntegrationCredentialDto> {
    return this.integrationsService.setupCredential(
      auth,
      dto.type,
      dto.providerName,
      dto.credentials
    );
  }

  @Post("document/validate")
  @HttpCode(201)
  async validateDocument(
    @Auth() auth: AuthContext,
    @Body() dto: ValidateDocumentDto & { clientId: string }
  ): Promise<DocumentRequestDto> {
    return this.integrationsService.validateDocument(auth, dto.clientId, {
      documentNumber: dto.documentNumber,
      documentType: dto.documentType,
    });
  }

  @Post("ocr/request")
  @HttpCode(201)
  async requestOcr(
    @Auth() auth: AuthContext,
    @Body() dto: RequestOcrDto & { clientId?: string }
  ): Promise<OcrResultDto> {
    return this.integrationsService.requestOcr(auth, dto.clientId || null, {
      fileUrl: dto.fileUrl,
      documentType: dto.documentType,
    });
  }

  @Post("ocr/:id/approve")
  @HttpCode(200)
  async approveOcr(
    @Auth() auth: AuthContext,
    @Param("id") id: string
  ): Promise<OcrResultDto> {
    return this.integrationsService.approveOcrResult(auth, id);
  }

  @Post("ocr/:id/reject")
  @HttpCode(200)
  async rejectOcr(
    @Auth() auth: AuthContext,
    @Param("id") id: string,
    @Body() dto: RejectOcrResultDto
  ): Promise<OcrResultDto> {
    return this.integrationsService.rejectOcrResult(auth, id, dto.reason);
  }

  @Post("whatsapp/send")
  @HttpCode(201)
  async sendWhatsapp(
    @Auth() auth: AuthContext,
    @Body() dto: SendWhatsappDto
  ): Promise<WhatsappMessageDto> {
    return this.integrationsService.sendWhatsapp(auth, {
      phone: dto.phone,
      message: dto.message,
      template: dto.template,
      variables: dto.variables,
    });
  }

  @Post("payments")
  @HttpCode(201)
  async createPayment(
    @Auth() auth: AuthContext,
    @Body() dto: CreatePaymentDto
  ): Promise<PaymentDto> {
    return this.integrationsService.createPayment(auth, {
      amount: dto.amount,
      currency: dto.currency,
      paymentMethod: dto.paymentMethod,
      cardToken: dto.cardToken,
      idempotencyKey: dto.idempotencyKey,
    });
  }

  @Post("payments/:paymentId/splits")
  @HttpCode(201)
  async createSplit(
    @Auth() auth: AuthContext,
    @Param("paymentId") paymentId: string,
    @Body() dto: CreatePaymentSplitDto
  ): Promise<PaymentSplitDto> {
    return this.integrationsService.createPaymentSplit(
      auth,
      paymentId,
      dto.recipientRole,
      dto.recipientUserId || null,
      dto.amount,
      dto.percentage
    );
  }
}
