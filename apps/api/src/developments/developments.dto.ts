import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  Max,
} from "class-validator";

export class CreateDevelopmentDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  developerCompany?: string;

  @IsString()
  @IsNotEmpty()
  location!: string;

  @IsDateString()
  launchDate!: string;

  @IsOptional()
  @IsDateString()
  deliveryForecast?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  commissionPercentage!: number;

  @IsOptional()
  @IsUUID()
  campaignId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  heroAssetId?: string;
}

export class CreateBlockDto {
  @IsUUID()
  developmentId!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class CreateLotDto {
  @IsUUID()
  developmentId!: string;

  @IsUUID()
  blockId!: string;

  @IsString()
  @IsNotEmpty()
  lotNumber!: string;

  @IsNumber()
  @Min(0)
  areaM2!: number;

  @IsNumber()
  @Min(0)
  basePrice!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  promotionalPrice?: number;

  @IsNumber()
  @Min(0)
  minDownPayment!: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxInstallments?: number;
}

export class ReserveLotDto {
  @IsUUID()
  lotId!: string;

  @IsUUID()
  clientId!: string;

  @IsDateString()
  expiresAt!: string;
}

export class SimulateLotDto {
  @IsUUID()
  lotId!: string;

  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsNumber()
  @Min(0)
  entryAmount!: number;

  @IsNumber()
  @Min(1)
  installments!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  interestRate?: number;
}

export class ProposeLotDto {
  @IsUUID()
  developmentId!: string;

  @IsUUID()
  lotId!: string;

  @IsUUID()
  clientId!: string;

  @IsNumber()
  @Min(0)
  proposedPrice!: number;

  @IsNumber()
  @Min(0)
  entryAmount!: number;

  @IsNumber()
  @Min(1)
  installments!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  interestRate?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class ApproveLotProposalDto {
  @IsNumber()
  @Min(0)
  finalPrice!: number;

  @IsOptional()
  @IsString()
  contractNumber?: string;
}
