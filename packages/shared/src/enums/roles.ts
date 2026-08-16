/** Papéis funcionais (ARCHITECTURE.md §8.1). PLATFORM_ADMIN é interno. */
export const USER_ROLES = ["PLATFORM_ADMIN", "ADMIN", "MANAGER", "BROKER"] as const;

export type UserRole = (typeof USER_ROLES)[number];

/** Papéis oferecidos na gestão de usuários da imobiliária. */
export const TENANT_USER_ROLES = ["ADMIN", "MANAGER", "BROKER"] as const;

export type TenantUserRole = (typeof TENANT_USER_ROLES)[number];

const RANK: Record<UserRole, number> = {
  PLATFORM_ADMIN: 4,
  ADMIN: 3,
  MANAGER: 2,
  BROKER: 1,
};

/** true quando `role` tem pelo menos o nível de `minimum`. */
export function roleAtLeast(role: UserRole, minimum: UserRole): boolean {
  return RANK[role] >= RANK[minimum];
}
