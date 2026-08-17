import {
  IsString,
  IsEnum,
  IsObject,
  IsOptional,
  IsUUID,
  IsNumber,
  IsDate,
  IsBoolean,
} from "class-validator";
import { Type } from "class-transformer";
import { IntegrationType, PaymentStatus, SplitRecipientRole } from "@sena/shared";

export class SetupIntegrationCredentialDto {
  @IsEnum(IntegrationType)
  type!: IntegrationType;

  @IsString()
  providerName!: string;

  @IsObject()
  credentials!: Record<string, any>;
}

export class CreatePaymentDto {
  @IsNumber()
  amount!: number;

  @IsString()
  currency!: string;

  @IsString()
  paymentMethod!: string;

  @IsOptional()
  @IsString()
  cardToken?: string;

  @IsString()
  idempotencyKey!: string;
}

export class CreatePaymentSplitDto {
  @IsUUID()
  paymentId!: string;

  @IsEnum(SplitRecipientRole)
  recipientRole!: SplitRecipientRole;

  @IsOptional()
  @IsUUID()
  recipientUserId?: string;

  @IsNumber()
  amount!: number;

  @IsNumber()
  percentage!: number;
}

export class ValidateDocumentDto {
  @IsString()
  documentNumber!: string;

  @IsEnum(["CPF", "CNPJ"])
  documentType!: "CPF" | "CNPJ";
}

export class RequestOcrDto {
  @IsString()
  fileUrl!: string;

  @IsString()
  documentType!: string;
}

export class SendWhatsappDto {
  @IsString()
  phone!: string;

  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  template?: string;

  @IsOptional()
  @IsObject()
  variables?: Record<string, string>;
}

export class ApproveOcrResultDto {
  @IsUUID()
  ocrResultId!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectOcrResultDto {
  @IsUUID()
  ocrResultId!: string;

  @IsString()
  reason!: string;
}
