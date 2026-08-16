import type { SenaTab } from "../components/senaCrm/SenaSidebar";

/**
 * Mapa tab <-> URL real (ARCHITECTURE.md §4.2).
 * A navegação visual continua a mesma; muda apenas a fonte da verdade: a URL.
 */
export const TAB_TO_PATH: Record<SenaTab, string> = {
  dashboard: "/dashboard",
  leads: "/leads",
  funil: "/leads/funil",
  clientes: "/clientes",
  visitas: "/visitas",
  propostas: "/propostas",
  imoveis: "/imoveis",
  proprietarios: "/proprietarios",
  vendas: "/vendas",
  "locacoes-contratos": "/locacoes/contratos",
  "locacoes-repasses": "/locacoes/repasses",
  "locacoes-vistorias": "/locacoes/vistorias",
  "locacoes-manutencoes": "/locacoes/manutencoes",
  "loteamentos-empreendimentos": "/empreendimentos",
  "loteamentos-espelho": "/empreendimentos/espelho",
  "loteamentos-simulador": "/empreendimentos/simulador",
  "loteamentos-reservas": "/empreendimentos/reservas",
  "equipe-corretores": "/corretores",
  "equipe-comissoes": "/comissoes",
  "equipe-ranking": "/corretores/ranking",
  "sistema-usuarios": "/configuracoes/usuarios",
  "sistema-configuracoes": "/configuracoes",
};

export const DEFAULT_TAB: SenaTab = "dashboard";
export const DEFAULT_PATH = TAB_TO_PATH[DEFAULT_TAB];

const PATH_TO_TAB = new Map<string, SenaTab>(
  (Object.entries(TAB_TO_PATH) as [SenaTab, string][]).map(([tab, path]) => [path, tab])
);

/** Resolve a tab a partir do pathname; rotas desconhecidas caem no dashboard. */
export function tabFromPath(pathname: string): SenaTab {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;

  return PATH_TO_TAB.get(normalized) ?? DEFAULT_TAB;
}

export function pathFromTab(tab: SenaTab): string {
  return TAB_TO_PATH[tab] ?? DEFAULT_PATH;
}
