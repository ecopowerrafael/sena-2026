import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateLeaseDto {
  @IsString()
  @IsNotEmpty()
  contractNumber!: string;

  @IsUUID()
  propertyId!: string;

  @IsOptional()
  @IsUUID()
  responsibleBrokerId?: string;

  @IsNumber()
  @Min(0)
  monthlyRent!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  condoFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  iptuFee?: number;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsNumber()
  dueDay!: number;

  @IsString()
  guaranteeType!: string;

  @IsNumber()
  @Min(0)
  adminFeePercentage!: number;

  @IsOptional()
  @IsString()
  adjustmentIndex?: string;

  @IsOptional()
  @IsDateString()
  nextAdjustmentDate?: string;
}

export class UpdateLeaseDto {
  @IsOptional()
  @IsString()
  contractNumber?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyRent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  adminFeePercentage?: number;

  @IsOptional()
  @IsString()
  status?: "ACTIVE" | "PAUSED" | "COMPLETED" | "TERMINATED";

  @IsOptional()
  @IsDateString()
  nextAdjustmentDate?: string;
}

export class AddLeaseTenantDto {
  @IsUUID()
  clientId!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  percentage?: number;
}

export class AddLeaseOwnerDto {
  @IsUUID()
  clientId!: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  percentage!: number;
}

export class CreateRentChargeDto {
  @IsUUID()
  leaseId!: string;

  @IsDateString()
  competence!: string;

  @IsDateString()
  dueDate!: string;

  @IsNumber()
  @Min(0)
  rentAmount!: number;

  @IsNumber()
  @Min(0)
  condoAmount!: number;

  @IsNumber()
  @Min(0)
  iptuAmount!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  otherAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fineAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  interestAmount?: number;
}

export class CreateRentPaymentDto {
  @IsUUID()
  chargeId!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsDateString()
  paymentDate!: string;

  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AddRentalExpenseDto {
  @IsUUID()
  leaseId!: string;

  @IsDateString()
  competence!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNumber()
  @Min(0)
  amount!: number;
}

export class CreateInspectionDto {
  @IsUUID()
  leaseId!: string;

  @IsString()
  @IsNotEmpty()
  inspectionType!: "ENTRY" | "PERIODIC" | "EXIT";

  @IsOptional()
  @IsString()
  inspectorName?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsDateString()
  inspectedAt!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InspectionItemDto)
  items?: InspectionItemDto[];
}

export class InspectionItemDto {
  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateMaintenanceRequestDto {
  @IsUUID()
  leaseId!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;
}

export class ApproveMaintenanceQuoteDto {
  @IsUUID()
  quoteId!: string;
}

export class CreateMaintenanceEventDto {
  @IsUUID()
  requestId!: string;

  @IsUUID()
  providerId!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsString()
  invoiceUrl?: string;
}

export class CreateServiceProviderDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
