import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  ACTIVITY_TYPES,
  CLIENT_ROLES,
  CLIENT_TYPES,
  LEAD_STATUSES,
  type ActivityTypeValue,
  type ClientRoleValue,
  type ClientTypeValue,
  type LeadStatusValue,
} from "@sena/shared";
import { Type } from "class-transformer";
import {
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

/** Cliente embutido: permite cadastrar lead e cliente na mesma ação, como na tela do funil. */
export class InlineClientDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  name!: string;

  @ApiPropertyOptional({ enum: CLIENT_TYPES })
  @IsOptional()
  @IsIn(CLIENT_TYPES as unknown as string[])
  type?: ClientTypeValue;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(32)
  document?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(32)
  whatsapp?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail({}, { message: "Informe um e-mail válido." })
  @MaxLength(180)
  email?: string;

  @ApiPropertyOptional({ enum: CLIENT_ROLES, isArray: true })
  @IsOptional()
  @IsArray()
  @IsIn(CLIENT_ROLES as unknown as string[], { each: true })
  roles?: ClientRoleValue[];
}

export class CreateLeadDto {
  @ApiPropertyOptional({ description: "Cliente existente. Alternativa a `client`." })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({ type: InlineClientDto })
  @IsOptional()
  @Type(() => InlineClientDto)
  client?: InlineClientDto;

  @ApiProperty({ description: "Origem é obrigatória (ARCHITECTURE.md §11)." })
  @IsString()
  @MinLength(1, { message: "A origem do lead é obrigatória." })
  originId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  campaignId?: string;

  @ApiPropertyOptional({ description: "Padrão: o próprio usuário autenticado." })
  @IsOptional()
  @IsString()
  assignedBrokerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedBudget?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  nextContactAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes?: string;
}

export class UpdateLeadDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  originId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  campaignId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedBrokerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedBudget?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  lastContactAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  nextContactAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes?: string;
}

export class ChangeLeadStatusDto {
  @ApiProperty({ enum: LEAD_STATUSES })
  @IsIn(LEAD_STATUSES as unknown as string[])
  status!: LeadStatusValue;

  @ApiPropertyOptional({ description: "Obrigatório quando o status for LOST." })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}

export class ListLeadsQueryDto {
  @ApiPropertyOptional({ enum: LEAD_STATUSES })
  @IsOptional()
  @IsIn(LEAD_STATUSES as unknown as string[])
  status?: LeadStatusValue;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedBrokerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  originId?: string;

  @ApiPropertyOptional({ description: "Busca pelo nome, e-mail ou telefone do cliente." })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;
}

export class CreateActivityDto {
  @ApiProperty({ enum: ACTIVITY_TYPES })
  @IsIn(ACTIVITY_TYPES as unknown as string[])
  type!: ActivityTypeValue;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  description!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  occurredAt?: string;
}

export class CreateLeadOriginDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;
}

export class CreateCampaignDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  originId?: string;
}
