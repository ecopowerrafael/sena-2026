import React, { useState } from "react";
import {
  BarChart3,
  Download,
  DollarSign,
  Building,
  Calendar,
  KeyRound,
  Trees,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useReports } from "../../hooks/useReports";

export const ReportsModule: React.FC = () => {
  const { metrics, loading, error } = useReports();
  const [reportType, setReportType] = useState<
    "vendas" | "captacoes" | "visitas" | "locacao" | "loteamentos"
  >("vendas");
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleExportCSV = () => {
    setDownloadSuccess(`Relatório_${reportType.toUpperCase()}_2026.csv`);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Export Action */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <BarChart3 className="w-4 h-4" />
            Centro de Inteligência Imobiliária & BI
          </div>
          <h2 className="text-lg font-bold text-white">Relatórios Gerenciais e Auditoria</h2>
          <p className="text-xs text-slate-400">
            Consolidação de dados operacionais e financeiros
          </p>
        </div>

        <div className="flex items-center gap-2">
          {downloadSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{downloadSuccess} gerado com sucesso!</span>
            </div>
          )}
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "vendas", label: "Vendas", icon: DollarSign },
          { id: "captacoes", label: "Captações", icon: Building },
          { id: "visitas", label: "Visitas", icon: Calendar },
          { id: "locacao", label: "Locação", icon: KeyRound },
          { id: "loteamentos", label: "Loteamentos", icon: Trees },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = reportType === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setReportType(t.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                isActive
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Error & Loading */}
      {error && (
        <div className="bg-rose-500/20 border border-rose-500/30 rounded-lg p-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span className="text-sm text-rose-300">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
        </div>
      ) : (
        <>
          {/* REPORT: VENDAS */}
          {reportType === "vendas" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">
                    VGV Total Fechado
                  </span>
                  <p className="text-xl font-black text-amber-400">
                    {formatCurrency(metrics?.vgv.total || 0)}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">
                    Honorários Gerados (6%)
                  </span>
                  <p className="text-xl font-black text-emerald-400">
                    {formatCurrency(metrics?.commissions.expected || 0)}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">
                    Vendas Totais
                  </span>
                  <p className="text-xl font-black text-white">
                    {metrics?.sales.total || 0}
                  </p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
                  Detalhes de Vendas
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="p-3 bg-slate-800 rounded">
                    <p className="text-slate-400 text-xs">Clientes</p>
                    <p className="text-white font-bold">{metrics?.clients.total || 0}</p>
                  </div>
                  <div className="p-3 bg-slate-800 rounded">
                    <p className="text-slate-400 text-xs">Imóveis</p>
                    <p className="text-white font-bold">{metrics?.properties.total || 0}</p>
                  </div>
                  <div className="p-3 bg-slate-800 rounded">
                    <p className="text-slate-400 text-xs">Conversão</p>
                    <p className="text-emerald-400 font-bold">
                      {metrics?.sales.total && metrics?.leads.total
                        ? ((metrics.sales.total / metrics.leads.total) * 100).toFixed(1)
                        : "0"}
                      %
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800 rounded">
                    <p className="text-slate-400 text-xs">Ticket Médio</p>
                    <p className="text-amber-400 font-bold">
                      {metrics?.sales.total
                        ? formatCurrency(metrics.vgv.total / metrics.sales.total)
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REPORT: CAPTAÇÕES */}
          {reportType === "captacoes" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-white">
                Captações Ativas no Portfólio ({metrics?.properties.total || 0} imóveis)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Imóveis</p>
                  <p className="text-white font-bold text-lg">{metrics?.properties.total}</p>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Proprietários</p>
                  <p className="text-white font-bold text-lg">{metrics?.clients.total}</p>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">VGV Ativo</p>
                  <p className="text-amber-400 font-bold text-lg">
                    {formatCurrency(metrics?.vgv.total || 0)}
                  </p>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Corretores</p>
                  <p className="text-emerald-400 font-bold text-lg">
                    {metrics?.ranking.topBrokers.length || 0}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* REPORT: VISITAS */}
          {reportType === "visitas" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-white mb-4">
                Relatório de Visitação e Índice de Conversão
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Total de Leads</p>
                  <p className="text-white font-bold text-lg">{metrics?.leads.total}</p>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Vendas</p>
                  <p className="text-amber-400 font-bold text-lg">{metrics?.sales.total}</p>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Taxa Conversão</p>
                  <p className="text-emerald-400 font-bold text-lg">
                    {metrics?.sales.total && metrics?.leads.total
                      ? ((metrics.sales.total / metrics.leads.total) * 100).toFixed(1)
                      : "0"}
                    %
                  </p>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">VGV</p>
                  <p className="text-blue-400 font-bold text-lg">
                    {formatCurrency(metrics?.vgv.total || 0)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* REPORT: LOCAÇÃO */}
          {reportType === "locacao" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-white mb-4">
                Relatório Financeiro de Locação
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Locações Ativas
                  </span>
                  <p className="text-xl font-black text-white mt-2">{metrics?.leases.active}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Inadimplência
                  </span>
                  <p className="text-xl font-black text-rose-400 mt-2">
                    {metrics?.arrears.chargeCount || 0} atrasos
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-800 rounded-lg">
                <p className="text-slate-400 text-xs mb-2">Dados de Locação</p>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Total de Contratos</p>
                    <p className="text-white font-bold">{metrics?.contracts.total}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Comissões</p>
                    <p className="text-emerald-400 font-bold">
                      {formatCurrency(metrics?.commissions.expected || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Renda Gerada</p>
                    <p className="text-blue-400 font-bold">
                      {formatCurrency(metrics?.leases.active ? metrics.leases.active * 2400 : 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REPORT: LOTEAMENTOS */}
          {reportType === "loteamentos" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-white mb-4">
                Relatório de Loteamentos e Developments
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Vendas</p>
                  <p className="text-white font-bold text-lg">{metrics?.sales.total}</p>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">VGV</p>
                  <p className="text-amber-400 font-bold text-lg">
                    {formatCurrency(metrics?.vgv.total || 0)}
                  </p>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Comissões</p>
                  <p className="text-emerald-400 font-bold text-lg">
                    {formatCurrency(metrics?.commissions.expected || 0)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
