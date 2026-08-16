import React from "react";
import {
  LayoutDashboard,
  Users,
  GitPullRequest,
  UserCheck,
  Calendar,
  FileSpreadsheet,
  Building2,
  Home,
  CheckCircle2,
  KeyRound,
  DollarSign,
  ArrowRightLeft,
  ClipboardCheck,
  Wrench,
  Trees,
  Grid3X3,
  Calculator,
  BookmarkCheck,
  Award,
  PieChart,
  Trophy,
  ShieldCheck,
  Settings,
  ArrowLeft,
  Layers,
  ChevronRight,
  LogOut,
} from "lucide-react";
import type { SessionUser } from "@sena/shared";
import { canSeeTab } from "../../routes/permissions";

export type SenaTab =
  | "dashboard"
  | "leads"
  | "funil"
  | "clientes"
  | "visitas"
  | "propostas"
  | "imoveis"
  | "proprietarios"
  | "vendas"
  | "locacoes-contratos"
  | "locacoes-repasses"
  | "locacoes-vistorias"
  | "locacoes-manutencoes"
  | "loteamentos-empreendimentos"
  | "loteamentos-espelho"
  | "loteamentos-simulador"
  | "loteamentos-reservas"
  | "equipe-corretores"
  | "equipe-comissoes"
  | "equipe-ranking"
  | "sistema-usuarios"
  | "sistema-configuracoes";

interface SenaSidebarProps {
  currentTab: SenaTab;
  onSelectTab: (tab: SenaTab) => void;
  onBackToPortfolio: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  user: SessionUser | null;
  onLogout: () => void;
}

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Administrador",
  MANAGER: "Gerente",
  BROKER: "Corretor",
  PLATFORM_ADMIN: "Administrador da plataforma",
};

export const SenaSidebar: React.FC<SenaSidebarProps> = ({
  currentTab,
  onSelectTab,
  onBackToPortfolio,
  isMobileOpen,
  setIsMobileOpen,
  user,
  onLogout,
}) => {
  const handleNav = (tab: SenaTab) => {
    onSelectTab(tab);
    setIsMobileOpen(false);
  };

  const navSections = [
    {
      title: "VISÃO GERAL",
      items: [
        {
          id: "dashboard" as SenaTab,
          label: "Dashboard Executivo",
          icon: LayoutDashboard,
          badge: "2026",
        },
      ],
    },
    {
      title: "COMERCIAL",
      items: [
        { id: "leads" as SenaTab, label: "Leads & Prospecção", icon: Users, count: 8 },
        {
          id: "funil" as SenaTab,
          label: "Funil de Vendas (Kanban)",
          icon: GitPullRequest,
          badge: "Ativo",
        },
        { id: "clientes" as SenaTab, label: "Clientes & Matching", icon: UserCheck },
        { id: "visitas" as SenaTab, label: "Agenda / Visitas", icon: Calendar, badge: "Hoje (2)" },
        {
          id: "propostas" as SenaTab,
          label: "Propostas & Negociações",
          icon: FileSpreadsheet,
          count: 2,
        },
      ],
    },
    {
      title: "IMÓVEIS",
      items: [
        { id: "imoveis" as SenaTab, label: "Carteira de Imóveis", icon: Home, count: 7 },
        { id: "proprietarios" as SenaTab, label: "Proprietários", icon: Building2 },
        {
          id: "vendas" as SenaTab,
          label: "Fechamentos de Venda",
          icon: CheckCircle2,
          badge: "Vendido",
        },
      ],
    },
    {
      title: "LOCAÇÕES",
      items: [
        {
          id: "locacoes-contratos" as SenaTab,
          label: "Contratos Administrados",
          icon: KeyRound,
          count: 4,
        },
        {
          id: "locacoes-repasses" as SenaTab,
          label: "Recebimentos & Repasses",
          icon: ArrowRightLeft,
        },
        { id: "locacoes-vistorias" as SenaTab, label: "Vistorias Técnicas", icon: ClipboardCheck },
        {
          id: "locacoes-manutencoes" as SenaTab,
          label: "Manutenções & Reparos",
          icon: Wrench,
          badge: "1 pend.",
        },
      ],
    },
    {
      title: "LOTEAMENTOS & URBANISMO",
      items: [
        {
          id: "loteamentos-empreendimentos" as SenaTab,
          label: "Empreendimentos",
          icon: Trees,
          count: 2,
        },
        {
          id: "loteamentos-espelho" as SenaTab,
          label: "Espelho de Vendas Visual",
          icon: Grid3X3,
          badge: "Mapa",
        },
        {
          id: "loteamentos-simulador" as SenaTab,
          label: "Simulador de Parcelas",
          icon: Calculator,
        },
        { id: "loteamentos-reservas" as SenaTab, label: "Reservas de Lotes", icon: BookmarkCheck },
      ],
    },
    {
      title: "EQUIPE & RESULTADOS",
      items: [
        {
          id: "equipe-corretores" as SenaTab,
          label: "Corretores & Desempenho",
          icon: Award,
          count: 5,
        },
        { id: "equipe-comissoes" as SenaTab, label: "Cálculo de Comissões", icon: DollarSign },
        {
          id: "equipe-ranking" as SenaTab,
          label: "Ranking Comercial",
          icon: Trophy,
          badge: "Top 1",
        },
      ],
    },
    {
      title: "SISTEMA",
      items: [
        { id: "sistema-usuarios" as SenaTab, label: "Usuários & Acessos", icon: ShieldCheck },
        {
          id: "sistema-configuracoes" as SenaTab,
          label: "Configurações da Unidade",
          icon: Settings,
        },
      ],
    },
  ]
    // Itens sem permissão somem do menu; o bloqueio real continua sendo do backend.
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => canSeeTab(item.id, user?.role)),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        id="sena-sidebar"
        className={`fixed lg:static top-0 left-0 bottom-0 w-72 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col z-50 transition-transform duration-200 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-bold flex items-center justify-center shadow-lg shadow-amber-500/20 text-lg tracking-wider">
                S
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-white tracking-wide text-base">SENA</span>
                  <span className="text-xs bg-amber-500/20 text-amber-300 font-semibold px-1.5 py-0.5 rounded-md border border-amber-500/30">
                    CRM 2026
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Imóveis • Locações • Loteamentos
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onBackToPortfolio}
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar ao Portfólio Principal
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <p className="text-[10px] font-bold tracking-wider text-slate-400 px-3 uppercase mb-1">
                {section.title}
              </p>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20"
                        : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${isActive ? "text-slate-950" : "text-slate-400"}`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isActive
                              ? "bg-slate-950/20 text-slate-950"
                              : "bg-slate-800 text-amber-300 border border-amber-500/20"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {item.count !== undefined && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            isActive
                              ? "bg-slate-950 text-amber-400"
                              : "bg-slate-800 text-slate-300 border border-slate-700"
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Session Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-850/60 border border-slate-800">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-bold flex items-center justify-center text-xs ring-2 ring-amber-500/30">
                {(user?.name ?? "?")
                  .split(" ")
                  .slice(0, 2)
                  .map((part) => part.charAt(0).toUpperCase())
                  .join("")}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.name ?? "Sessão"}</p>
              <p className="text-[10px] text-amber-400 font-medium truncate">
                {user ? `${ROLE_LABEL[user.role] ?? user.role} • ${user.tenantName}` : ""}
              </p>
            </div>
            <button
              onClick={onLogout}
              title="Sair"
              aria-label="Sair"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
