/** Papéis previstos na Etapa 1 (ARCHITECTURE.md §8). Declarados aqui apenas como contrato compartilhado. */
export const USER_ROLES = ["ADMIN", "MANAGER", "BROKER"] as const;

export type UserRole = (typeof USER_ROLES)[number];
