import React from "react";
import {
  Users,
  Home,
  Building,
  DollarSign,
  Trophy,
  TrendingUp,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
  Layers,
  Trees,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart as RePieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import {
  Lead,
  Property,
  Broker,
  RentalContract,
  SaleClosure,
  Development,
} from "../../types/senaCrm";
import { SenaTab } from "./SenaSidebar";

interface DashboardModuleProps {
  leads: Lead[];
  properties: Property[];
  brokers: Broker[];
  rentalContracts: RentalContract[];
  sales: SaleClosure[];
  developments: Development[];
  onNavigateTab: (tab: SenaTab) => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  leads,
  properties,
  brokers,
  rentalContracts,
  sales,
  developments,
  onNavigateTab,
}) => {
  // Calculated KPIs
  const totalLeads = leads.length;
  const activeClients = leads.filter((l) => l.status !== "perdido").length;
  const availableProps = properties.filter((p) => p.status === "Disponível").length;
  const soldProps = properties.filter((p) => p.status === "Vendido").length;
  const rentedProps = properties.filter((p) => p.status === "Alugado").length;
  const inNegotiationProps = properties.filter((p) => p.status === "Em Negociação").length;

  const activeRentalContracts = rentalContracts.filter((c) => c.status === "Ativo").length;
  const overdueRentals = rentalContracts.filter(
    (c) => c.paymentStatus === "Em Atraso" || c.paymentStatus === "Vencido"
  ).length;

  const totalVgvSales = sales.reduce((acc, s) => acc + s.finalSalePrice, 0);
  const totalLoteamentosVgv = developments.reduce((acc, d) => acc + d.soldVgv, 0);
  const consolidatedVgv = totalVgvSales + totalLoteamentosVgv;

  const totalCommissionsGenerated = sales.reduce((acc, s) => acc + s.commissionTotal, 0);
  const totalCommissionsReceived = Math.round(totalCommissionsGenerated * 0.9);

  // Top broker ranking sorted by VGV
  const sortedBrokers = [...brokers].sort((a, b) => b.vgvTotal - a.vgvTotal);

  // Chart Data: VGV by Month (Real vs Meta)
  const vgvMonthlyData = [
    { month: "Mar", vgv: 4.2, meta: 3.5 },
    { month: "Abr", vgv: 5.8, meta: 5.0 },
    { month: "Mai", vgv: 8.4, meta: 7.0 },
    { month: "Jun", vgv: 11.2, meta: 9.0 },
    { month: "Jul", vgv: 14.6, meta: 12.0 },
    { month: "Ago (Atual)", vgv: 18.5, meta: 15.0 },
  ];

  // Lead Origin Pie Data
  const leadOriginCounts: Record<string, number> = {};
  leads.forEach((l) => {
    leadOriginCounts[l.origin] = (leadOriginCounts[l.origin] || 0) + 1;
  });
  const leadOriginData = Object.entries(leadOriginCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#6366f1", "#14b8a6"];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Quick Highlights */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-5 lg:p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              SENA 2026 • Visão Geral Consolidada
            </div>
            <h2 className="text-xl lg:text-2xl font-black text-white tracking-tight">
              Painel Geral de Performance Imobiliária
            </h2>
            <p className="text-xs lg:text-sm text-slate-400 max-w-2xl mt-1">
              Indicadores em tempo real para Vendas Alto Padrão, Locações Prime e Espelho de Vendas
              de Loteamentos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab("funil")}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-2"
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              Acessar Funil Kanban
            </button>
            <button
              onClick={() => onNavigateTab("loteamentos-espelho")}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <Trees className="w-3.5 h-3.5" />
              Espelho Loteamento
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid - Full Real Estate Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5">
        {/* VGV Total */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-xs col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">VGV Consolidado (2026)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white tracking-tight">
              {formatCurrency(consolidatedVgv)}
            </div>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-emerald-400 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18.4% acima da meta trimestral</span>
            </div>
          </div>
        </div>

        {/* Comissões Geradas */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-xs col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Comissões Totais Geradas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-400 tracking-tight">
              {formatCurrency(totalCommissionsGenerated)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Recebidas:{" "}
              <strong className="text-slate-200">{formatCurrency(totalCommissionsReceived)}</strong>{" "}
              (90%)
            </div>
          </div>
        </div>

        {/* Leads Recebidos */}
        <div
          onClick={() => onNavigateTab("leads")}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 cursor-pointer transition-all shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Leads Ativos</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">{totalLeads}</div>
          <span className="text-[10px] text-slate-400">Em 8 origens de captação</span>
        </div>

        {/* Clientes Cadastrados */}
        <div
          onClick={() => onNavigateTab("clientes")}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 cursor-pointer transition-all shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Clientes Base</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">{activeClients}</div>
          <span className="text-[10px] text-emerald-400 font-medium">
            Compradores / Investidores
          </span>
        </div>

        {/* Imóveis Disponíveis */}
        <div
          onClick={() => onNavigateTab("imoveis")}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 cursor-pointer transition-all shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Imóveis Disponíveis</span>
            <Home className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 mt-2">{availableProps}</div>
          <span className="text-[10px] text-slate-400">Prontos p/ visitação</span>
        </div>

        {/* Imóveis Vendidos */}
        <div
          onClick={() => onNavigateTab("vendas")}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 cursor-pointer transition-all shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Imóveis Vendidos</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-2">{soldProps}</div>
          <span className="text-[10px] text-slate-400">Escrituras lavradas</span>
        </div>

        {/* Imóveis Alugados */}
        <div
          onClick={() => onNavigateTab("locacoes-contratos")}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 cursor-pointer transition-all shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Imóveis Alugados</span>
            <KeyRound className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">{rentedProps}</div>
          <span className="text-[10px] text-slate-400">Sob administração</span>
        </div>

        {/* Em Negociação / Proposta */}
        <div
          onClick={() => onNavigateTab("propostas")}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 cursor-pointer transition-all shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Em Negociação</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-300 mt-2">{inNegotiationProps}</div>
          <span className="text-[10px] text-slate-400">Propostas ativas</span>
        </div>

        {/* Contratos de Locação Ativos */}
        <div
          onClick={() => onNavigateTab("locacoes-contratos")}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 cursor-pointer transition-all shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Contratos Locação</span>
            <KeyRound className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">{activeRentalContracts}</div>
          <span className="text-[10px] text-slate-400">Garantias vigentes</span>
        </div>

        {/* Aluguéis Vencidos / Em Atraso */}
        <div
          onClick={() => onNavigateTab("locacoes-repasses")}
          className={`border rounded-xl p-4 cursor-pointer transition-all shadow-xs ${
            overdueRentals > 0
              ? "bg-rose-950/20 border-rose-800/60 hover:border-rose-700"
              : "bg-slate-900 border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Aluguéis Vencidos</span>
            <AlertTriangle
              className={`w-4 h-4 ${overdueRentals > 0 ? "text-rose-400" : "text-slate-500"}`}
            />
          </div>
          <div
            className={`text-2xl font-extrabold mt-2 ${overdueRentals > 0 ? "text-rose-400" : "text-slate-300"}`}
          >
            {overdueRentals}
          </div>
          <span className="text-[10px] text-rose-300 font-medium">Requer cobrança amigável</span>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* VGV Evolution Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Evolução do VGV Mensal (Milhões R$)
              </h3>
              <p className="text-xs text-slate-400">
                Comparativo entre VGV Realizado e Meta Projetada
              </p>
            </div>
            <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              Ano Fiscal 2026
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vgvMonthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) => `R$${val}M`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [`R$ ${val} Milhões`, ""]}
                />
                <Bar dataKey="meta" fill="#475569" name="Meta Projetada" radius={[4, 4, 0, 0]} />
                <Bar dataKey="vgv" fill="#f59e0b" name="VGV Realizado" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Origins Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              Origem dos Leads Captados
            </h3>
            <p className="text-xs text-slate-400 mb-2">Canais de maior conversão</p>

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={leadOriginData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {leadOriginData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-800 text-[11px]">
            {leadOriginData.slice(0, 4).map((entry, idx) => (
              <div key={idx} className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="text-slate-300 truncate">{entry.name}:</span>
                <span className="font-bold text-white">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Brokers Ranking & Quick Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ranking de Corretores */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                Ranking de Corretores & Performance
              </h3>
              <p className="text-xs text-slate-400">
                Classificação por VGV gerado e taxa de conversão
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("equipe-ranking")}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              Ver Completo <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {sortedBrokers.slice(0, 4).map((broker, idx) => (
              <div
                key={broker.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-850/60 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      idx === 0
                        ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                        : idx === 1
                          ? "bg-slate-300 text-slate-900"
                          : idx === 2
                            ? "bg-amber-700 text-white"
                            : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <img
                    src={broker.avatar}
                    alt={broker.name}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{broker.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {broker.team} • {broker.creci}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right shrink-0">
                  <div>
                    <span className="text-[10px] text-slate-400 block">VGV Acumulado</span>
                    <span className="text-xs font-bold text-amber-300">
                      {formatCurrency(broker.vgvTotal)}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-[10px] text-slate-400 block">Conversão</span>
                    <span className="text-xs font-bold text-emerald-400">
                      {broker.conversionRate}%
                    </span>
                  </div>
                  <div className="hidden md:block">
                    <span className="text-[10px] text-slate-400 block">Vendas</span>
                    <span className="text-xs font-bold text-white">{broker.salesCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Operational Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-amber-400" />
              Ações Críticas do Dia
            </h3>
            <p className="text-xs text-slate-400 mb-4">Prazos e atendimentos urgentes</p>

            <div className="space-y-2.5">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                <div className="flex items-center justify-between font-bold text-amber-300">
                  <span>Proposta em Análise</span>
                  <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded">R$ 4.7M</span>
                </div>
                <p className="text-slate-300 text-[11px] mt-1">
                  Guilherme Leite aguarda resposta do Alphaville 1.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs">
                <div className="flex items-center justify-between font-bold text-blue-300">
                  <span>Visita Agendada Hoje</span>
                  <span className="text-[10px] bg-blue-500/20 px-1.5 py-0.5 rounded">10:30</span>
                </div>
                <p className="text-slate-300 text-[11px] mt-1">
                  Vanessa & Thiago no Garden Vila Nova Conceição.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs">
                <div className="flex items-center justify-between font-bold text-rose-300">
                  <span>Aluguel Vencido</span>
                  <span className="text-[10px] bg-rose-500/20 px-1.5 py-0.5 rounded">
                    R$ 16.500
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] mt-1">
                  Casa Comercial Harmonia (5 dias de atraso).
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <button
              onClick={() => onNavigateTab("visitas")}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              Ver Agenda Completa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
