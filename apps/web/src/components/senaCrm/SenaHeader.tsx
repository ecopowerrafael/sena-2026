import React, { useState } from "react";
import {
  Menu,
  Search,
  Bell,
  Plus,
  Building,
  Sparkles,
  Calendar,
  DollarSign,
  Home,
  UserPlus,
} from "lucide-react";
import { SenaTab } from "./SenaSidebar";

interface SenaHeaderProps {
  onToggleMobileMenu: () => void;
  onOpenQuickModal: (type: "lead" | "property" | "proposal" | "visit") => void;
  currentTab: SenaTab;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const SenaHeader: React.FC<SenaHeaderProps> = ({
  onToggleMobileMenu,
  onOpenQuickModal,
  currentTab,
  searchTerm,
  onSearchChange,
}) => {
  const [selectedBranch, setSelectedBranch] = useState("Matriz Alphaville / Faria Lima");
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const getTabTitle = (tab: SenaTab): { title: string; subtitle: string } => {
    switch (tab) {
      case "dashboard":
        return {
          title: "Painel Executivo & Indicadores",
          subtitle: "Consolidado Geral: Vendas, Locações e Loteamentos",
        };
      case "leads":
        return {
          title: "Gestão de Leads & Prospecção",
          subtitle: "Rastreamento completo de origens e campanhas",
        };
      case "funil":
        return {
          title: "Funil Comercial de Vendas (Kanban)",
          subtitle: "Acompanhamento dinâmico de etapas até o fechamento",
        };
      case "clientes":
        return {
          title: "Clientes & Perfil de Interesse",
          subtitle: "Base de compradores, locatários, investidores e matching inteligente",
        };
      case "visitas":
        return {
          title: "Agenda & Controle de Visitas",
          subtitle: "Agendamentos, visitas do dia e feedbacks de clientes",
        };
      case "propostas":
        return {
          title: "Propostas & Histórico de Negociações",
          subtitle: "Valores propostos, contrapropostas e aprovações",
        };
      case "imoveis":
        return {
          title: "Carteira Completa de Imóveis",
          subtitle: "Catálogo de alto padrão com filtros e status",
        };
      case "proprietarios":
        return {
          title: "Base de Proprietários & Locadores",
          subtitle: "Gestão de patrimônio e relacionamento",
        };
      case "vendas":
        return {
          title: "Fechamentos de Venda Concluídos",
          subtitle: "Contratos assinados, VGV realizado e comissões",
        };
      case "locacoes-contratos":
        return {
          title: "Contratos de Locação Administrados",
          subtitle: "Garantias locatícias, vencimentos e reajustes",
        };
      case "locacoes-repasses":
        return {
          title: "Recebimentos & Repasses aos Proprietários",
          subtitle: "Cálculo automático: Aluguel - Taxa adm - Despesas = Líquido",
        };
      case "locacoes-vistorias":
        return {
          title: "Vistorias Técnicas (Entrada/Saída)",
          subtitle: "Laudos fotográficos e aprovações digitais",
        };
      case "locacoes-manutencoes":
        return {
          title: "Chamados de Manutenção & Reparos",
          subtitle: "Prestadores de serviços e autorizações de despesas",
        };
      case "loteamentos-empreendimentos":
        return {
          title: "Empreendimentos & Lançamentos",
          subtitle: "Loteamentos fechados e urbanismo sustentável",
        };
      case "loteamentos-espelho":
        return {
          title: "Espelho de Vendas Visual Interativo",
          subtitle: "Mapa em tempo real das quadras e lotes por status",
        };
      case "loteamentos-simulador":
        return {
          title: "Simulador Financeiro de Lotes",
          subtitle: "Cálculo de entrada, parcelamento direto e saldo financiado",
        };
      case "loteamentos-reservas":
        return {
          title: "Reservas & Bloqueios de Lotes",
          subtitle: "Gestão de reservas temporárias com bloqueio antifuro",
        };
      case "equipe-corretores":
        return {
          title: "Equipe de Corretores & Performance",
          subtitle: "CRECI, VGV acumulado, conversão e metas",
        };
      case "equipe-comissoes":
        return {
          title: "Distribuição e Divisão de Comissões",
          subtitle: "Cálculo transparente entre imobiliária, gerente, captador e corretor",
        };
      case "equipe-ranking":
        return {
          title: "Ranking Comercial & Premiações",
          subtitle: "Destaques do mês e trimestre em VGV gerado",
        };
      case "sistema-usuarios":
        return {
          title: "Gestão de Usuários & Níveis de Acesso",
          subtitle: "Permissões de corretores, gerentes e diretores",
        };
      case "sistema-configuracoes":
        return {
          title: "Configurações da Imobiliária SENA",
          subtitle: "Parâmetros operacionais, índices e percentuais padrão",
        };
      default:
        return { title: "CRM Imobiliário SENA 2026", subtitle: "Plataforma Imobiliária Integrada" };
    }
  };

  const { title, subtitle } = getTabTitle(currentTab);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-xs">
      <div className="px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button & Tab Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleMobileMenu}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white lg:hidden border border-slate-700 focus:outline-none"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-base lg:text-lg font-bold text-white tracking-tight truncate flex items-center gap-2">
              {title}
            </h1>
            <p className="text-xs text-slate-400 truncate hidden sm:block">{subtitle}</p>
          </div>
        </div>

        {/* Center/Right: Search, Branch Selector, Quick Actions, Notifications */}
        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          {/* Global Search Input */}
          <div className="relative hidden md:block w-64 lg:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar imóvel, cliente, corretor..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-1.5 py-0.5 rounded"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Branch Selector */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <Building className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer font-medium"
            >
              <option value="Matriz Alphaville / Faria Lima" className="bg-slate-900 text-white">
                Matriz Alphaville & Faria Lima
              </option>
              <option value="Unidade Jardins & Moema" className="bg-slate-900 text-white">
                Unidade Jardins & Moema
              </option>
              <option
                value="Plantão Loteamentos Itu / Sorocaba"
                className="bg-slate-900 text-white"
              >
                Plantão Loteamentos Itu / Sorocaba
              </option>
            </select>
          </div>

          {/* Notifications Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 relative transition-colors"
              title="Notificações"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-3 text-xs space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-white">Notificações Recentes</span>
                  <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded">
                    3 Novas
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                    <p className="font-semibold text-amber-300">Nova Proposta Cadastrada</p>
                    <p className="text-slate-300 text-[11px]">
                      Guilherme Leite propôs R$ 4.600.000 no imóvel SENA-801.
                    </p>
                    <span className="text-[10px] text-slate-400">Há 25 minutos</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                    <p className="font-semibold text-emerald-300">Reserva de Lote Efetuada</p>
                    <p className="text-slate-300 text-[11px]">
                      Lote 04 - Quadra B (Reserva dos Ipês) reservado.
                    </p>
                    <span className="text-[10px] text-slate-400">Há 1 hora</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                    <p className="font-semibold text-blue-300">Aluguel Confirmado</p>
                    <p className="text-slate-300 text-[11px]">
                      Venture Partners efetuou pagamento de R$ 45.000.
                    </p>
                    <span className="text-[10px] text-slate-400">Hoje às 09:30</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Button */}
          <div className="relative">
            <button
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Novo Registro</span>
            </button>

            {showQuickMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-1.5 text-xs space-y-1">
                <button
                  onClick={() => {
                    onOpenQuickModal("lead");
                    setShowQuickMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white text-left font-medium transition-colors"
                >
                  <UserPlus className="w-4 h-4 text-amber-400" />
                  <span>Cadastrar Novo Lead</span>
                </button>
                <button
                  onClick={() => {
                    onOpenQuickModal("property");
                    setShowQuickMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white text-left font-medium transition-colors"
                >
                  <Home className="w-4 h-4 text-emerald-400" />
                  <span>Cadastrar Novo Imóvel</span>
                </button>
                <button
                  onClick={() => {
                    onOpenQuickModal("proposal");
                    setShowQuickMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white text-left font-medium transition-colors"
                >
                  <DollarSign className="w-4 h-4 text-blue-400" />
                  <span>Registrar Proposta Comercial</span>
                </button>
                <button
                  onClick={() => {
                    onOpenQuickModal("visit");
                    setShowQuickMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white text-left font-medium transition-colors"
                >
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span>Agendar Visita</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
