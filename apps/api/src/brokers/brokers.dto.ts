import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PASSWORD_MIN_LENGTH, TENANT_USER_ROLES, type TenantUserRole } from "@sena/shared";
import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateBrokerDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiProperty()
  @IsEmail({}, { message: "Informe um e-mail válido." })
  @MaxLength(180)
  email!: string;

  @ApiProperty({ minLength: PASSWORD_MIN_LENGTH })
  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(200)
  password!: string;

  @ApiPropertyOptional({ enum: TENANT_USER_ROLES, default: "BROKER" })
  @IsOptional()
  @IsIn(TENANT_USER_ROLES as unknown as string[])
  role?: TenantUserRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  creci?: string;

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

  @ApiPropertyOptional({ description: "Nome da equipe; é criada se ainda não existir." })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  teamName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  managerUserId?: string;
}

export class UpdateBrokerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  creci?: string;

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
  @IsString()
  @MaxLength(120)
  teamName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  managerUserId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(400)
  avatarUrl?: string;
}
