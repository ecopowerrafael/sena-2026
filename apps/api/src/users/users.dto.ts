import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PASSWORD_MIN_LENGTH, TENANT_USER_ROLES, type TenantUserRole } from "@sena/shared";
import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
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

  @ApiProperty({ enum: TENANT_USER_ROLES })
  @IsIn(TENANT_USER_ROLES as unknown as string[])
  role!: TenantUserRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  creci?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;
}

export class UpdateUserStatusDto {
  @ApiProperty({ enum: ["ACTIVE", "INACTIVE"] })
  @IsIn(["ACTIVE", "INACTIVE"])
  status!: "ACTIVE" | "INACTIVE";
}
