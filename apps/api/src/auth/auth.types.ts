import type { UserRole } from "@sena/shared";

/**
 * Contexto autenticado. É a única fonte de `tenantId` para queries de negócio:
 * nenhum controller aceita tenant vindo do body/query (ARCHITECTURE.md §7.2).
 */
export interface AuthContext {
  userId: string;
  tenantId: string;
  role: UserRole;
  email: string;
  sessionId: string;
}

export interface AccessTokenPayload {
  sub: string;
  tenantId: string;
  role: UserRole;
  email: string;
  sid: string;
}
