import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class CreateVisitDto {
  @IsUUID()
  propertyId!: string;

  @IsUUID()
  clientId!: string;

  @IsDateString()
  scheduledAt!: string;

  @IsOptional()
  @IsNumber()
  durationMinutes?: number;
}

export class UpdateVisitDto {
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsNumber()
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  feedback?: string;

  @IsOptional()
  @IsString()
  impression?: string;

  @IsOptional()
  @IsString()
  status?: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
}

export class CreateProposalDto {
  @IsUUID()
  propertyId!: string;
  @IsUUID()
  clientId!: string;
  @IsNumber()
  @Min(0)
  advertisedPrice!: number;
  @IsNumber()
  @Min(0)
  proposedPrice!: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  downPayment?: number;

  @IsOptional()
  @IsNumber()
  installmentsCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  installmentsValue?: number;

  @IsString()
  paymentMethod!: string;
  @IsOptional()
  @IsString()
  paymentDescription?: string;
}

export class UpdateProposalDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  proposedPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  downPayment?: number;

  @IsOptional()
  @IsString()
  counterProposalNotes?: string;

  @IsOptional()
  @IsString()
  status?: "DRAFT" | "SUBMITTED" | "COUNTER_PROPOSED" | "APPROVED" | "REJECTED" | "EXPIRED";
}

export class ApproveProposalDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  finalSalePrice!: number;
  @IsDateString()
  saleDate!: string;
  @IsString()
  paymentType!: string;
  @IsOptional()
  @IsString()
  contractNumber?: string;
}

export class UpdateSaleDto {
  @IsOptional()
  @IsString()
  paymentType?: string;

  @IsOptional()
  @IsString()
  contractNumber?: string;

  @IsOptional()
  @IsString()
  documentationStatus?: string;

  @IsOptional()
  @IsString()
  status?: "PENDING" | "COMPLETED" | "CANCELLED";
}
