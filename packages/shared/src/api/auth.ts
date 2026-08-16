import type { UserRole } from "../enums/roles";

/** Usuário da sessão corrente. Nunca inclui hash de senha nem tokens. */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

/** Nome do cookie legível pelo browser usado no esquema double-submit de CSRF. */
export const CSRF_COOKIE = "sena_csrf";
export const CSRF_HEADER = "x-csrf-token";

export const PASSWORD_MIN_LENGTH = 10;
