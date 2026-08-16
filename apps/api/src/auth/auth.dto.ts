import { ApiProperty } from "@nestjs/swagger";
import { PASSWORD_MIN_LENGTH } from "@sena/shared";
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "admin@senaimoveis.com.br" })
  @IsEmail({}, { message: "Informe um e-mail válido." })
  @MaxLength(180)
  email!: string;

  @ApiProperty({ example: "SenaCrm2026!dev" })
  @IsString()
  @MinLength(1, { message: "Informe a senha." })
  @MaxLength(200)
  password!: string;
}

export class ForgotPasswordDto {
  @ApiProperty()
  @IsEmail({}, { message: "Informe um e-mail válido." })
  @MaxLength(180)
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(10)
  @MaxLength(400)
  token!: string;

  @ApiProperty({ minLength: PASSWORD_MIN_LENGTH })
  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH, {
    message: `A senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`,
  })
  @MaxLength(200)
  password!: string;
}
