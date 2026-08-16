import type { UserRole } from "@sena/shared";
import type { SenaTab } from "../components/senaCrm/SenaSidebar";

/**
 * Visibilidade de menu por papel. É conveniência de interface, não barreira:
 * a autorização real é do backend (ARCHITECTURE.md §30.7).
 */
const TAB_ROLES: Partial<Record<SenaTab, UserRole[]>> = {
  "equipe-comissoes": ["ADMIN", "MANAGER"],
  "equipe-ranking": ["ADMIN", "MANAGER"],
  "sistema-usuarios": ["ADMIN"],
  "sistema-configuracoes": ["ADMIN"],
  "locacoes-repasses": ["ADMIN", "MANAGER"],
};

export function canSeeTab(tab: SenaTab, role: UserRole | undefined): boolean {
  const allowed = TAB_ROLES[tab];

  if (!allowed) {
    return true;
  }

  return role ? allowed.includes(role) : false;
}
