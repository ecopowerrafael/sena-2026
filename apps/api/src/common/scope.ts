import type { AuthContext } from "../auth/auth.types";

/**
 * Corretor enxerga apenas a própria carteira; gerente e administrador enxergam
 * a imobiliária inteira. O escopo de tenant é aplicado sempre, em separado.
 */
export function ownerScope(auth: AuthContext, field: string): Record<string, string> {
  return auth.role === "BROKER" ? { [field]: auth.userId } : {};
}

export function isManagerOrAbove(auth: AuthContext): boolean {
  return auth.role === "ADMIN" || auth.role === "MANAGER" || auth.role === "PLATFORM_ADMIN";
}
