import React from "react";
import {
  Users,
  Home,
  TrendingUp,
  KeyRound,
  AlertTriangle,
  Loader2,
  DollarSign,
  Building,
  Trophy,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useDashboardAnalytics } from "../../hooks/useDashboardAnalytics";
import type { DashboardMetricsDto } from "@sena/shared";

export const DashboardModule: React.FC = () => {
  const { metrics, loading, error, refresh } = useDashboardAnalytics();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="bg-rose-500/20 border border-rose-500/30 rounded-lg p-4 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-rose-400" />
        <span className="text-sm text-rose-300">{error || "Erro ao carregar dashboard"}</span>
      </div>
    );
  }

  // KPI Cards
  const kpis = [
    {
      icon: Users,
      label: "Leads",
      value: metrics.leads.total,
      detail: `${metrics.leads.thisMonth} este mês`,
      color: "blue",
    },
    {
      icon: Users,
      label: "Clientes",
      value: metrics.clients.total,
      detail: `${metrics.clients.thisMonth} este mês`,
      color: "purple",
    },
    {
      icon: Home,
      label: "Imóveis",
      value: metrics.properties.total,
      detail: `${metrics.properties.available} disponíveis`,
      color: "amber",
    },
    {
      icon: TrendingUp,
      label: "Vendas",
      value: metrics.sales.total,
      detail: formatCurrency(metrics.sales.totalAmount),
      color: "emerald",
    },
    {
      icon: KeyRound,
      label: "Locações",
      value: metrics.leases.active,
      detail: `${metrics.leases.revenue} de receita`,
      color: "cyan",
    },
    {
      icon: DollarSign,
      label: "VGV",
      value: formatCurrency(metrics.vgv.total),
      detail: `${formatCurrency(metrics.vgv.thisMonth)} este mês`,
      color: "lime",
    },
    {
      icon: Trophy,
      label: "Comissões",
      value: formatCurrency(metrics.commissions.expected),
      detail: `${metrics.commissions.pending} pendentes`,
      color: "yellow",
    },
    {
      icon: AlertTriangle,
      label: "Inadimplência",
      value: metrics.arrears.chargeCount,
      detail: `${formatCurrency(metrics.arrears.amount)}`,
      color: "rose",
    },
  ];

  const getColorClasses = (
    color: string
  ): { bg: string; text: string; icon: string } => {
    const colors = {
      blue: { bg: "bg-blue-500/20", text: "text-blue-400", icon: "text-blue-400" },
      purple: { bg: "bg-purple-500/20", text: "text-purple-400", icon: "text-purple-400" },
      amber: { bg: "bg-amber-500/20", text: "text-amber-400", icon: "text-amber-400" },
      emerald: { bg: "bg-emerald-500/20", text: "text-emerald-400", icon: "text-emerald-400" },
      cyan: { bg: "bg-cyan-500/20", text: "text-cyan-400", icon: "text-cyan-400" },
      lime: { bg: "bg-lime-500/20", text: "text-lime-400", icon: "text-lime-400" },
      yellow: { bg: "bg-yellow-500/20", text: "text-yellow-400", icon: "text-yellow-400" },
      rose: { bg: "bg-rose-500/20", text: "text-rose-400", icon: "text-rose-400" },
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-1">
            <Building className="w-4 h-4" />
            Dashboard
          </div>
          <h2 className="text-lg font-bold text-white">Visão Geral Operacional</h2>
          <p className="text-xs text-slate-400">
            Métricas de todo o CRM • Atualizado em tempo real
          </p>
        </div>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-semibold text-white transition"
        >
          Atualizar
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          const colors = getColorClasses(kpi.color);
          return (
            <div
              key={idx}
              className={`${colors.bg} border border-slate-700 rounded-lg p-4`}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-semibold text-slate-400">{kpi.label}</p>
                <Icon className={`w-4 h-4 ${colors.icon}`} />
              </div>
              <p className={`text-lg font-bold ${colors.text}`}>
                {typeof kpi.value === "number" && kpi.value < 1000
                  ? kpi.value
                  : kpi.value}
              </p>
              <p className="text-xs text-slate-400 mt-1">{kpi.detail}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads by Status */}
        {Object.keys(metrics.leads.byStatus).length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Distribuição de Leads</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(metrics.leads.byStatus).map(([key, val]) => ({
                    name: key,
                    value: val as number,
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {["#3b82f6", "#a855f7", "#f59e0b", "#10b981", "#06b6d4"].map(
                    (color) => (
                      <Cell key={color} fill={color} />
                    )
                  )}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Brokers */}
        {metrics.ranking.topBrokers.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Ranking de Corretores</h3>
            <div className="space-y-2">
              {metrics.ranking.topBrokers.slice(0, 5).map((broker, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-800 rounded">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400">#{idx + 1}</span>
                    <p className="text-white text-sm">{broker.name || "Sem nome"}</p>
                  </div>
                  <p className="text-emerald-400 font-semibold">
                    {formatCurrency(broker.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Arrears Detail */}
      {metrics.arrears.chargeCount > 0 && (
        <div className="bg-rose-500/20 border border-rose-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <h3 className="font-semibold text-rose-300">Cobranças Vencidas</h3>
          </div>
          <p className="text-sm text-rose-300">
            {metrics.arrears.chargeCount} cobranças vencidas •{" "}
            <strong>{formatCurrency(metrics.arrears.amount)}</strong>
          </p>
        </div>
      )}
    </div>
  );
};
