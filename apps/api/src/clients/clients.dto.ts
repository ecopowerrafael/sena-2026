import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  CLIENT_ROLES,
  CLIENT_TYPES,
  type ClientRoleValue,
  type ClientTypeValue,
} from "@sena/shared";
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateClientDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  name!: string;

  @ApiPropertyOptional({ enum: CLIENT_TYPES })
  @IsOptional()
  @IsIn(CLIENT_TYPES as unknown as string[])
  type?: ClientTypeValue;

  @ApiPropertyOptional({ description: "CPF ou CNPJ, com ou sem máscara." })
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  responsibleBrokerId?: string;

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

export class UpdateClientDto extends CreateClientDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  declare name: string;
}

export class ListClientsQueryDto {
  @ApiPropertyOptional({ description: "Busca por nome, e-mail, telefone ou documento exato." })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @ApiPropertyOptional({ enum: CLIENT_ROLES })
  @IsOptional()
  @IsIn(CLIENT_ROLES as unknown as string[])
  role?: ClientRoleValue;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  responsibleBrokerId?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;

  @ApiPropertyOptional({ description: "Inclui clientes arquivados." })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeArchived?: boolean;
}
