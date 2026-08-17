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
  Filter,
} from "lucide-react";
import { useReports } from "../../hooks/useReports";

export const ReportsModule: React.FC = () => {
  const { reports, loading, error, loadReports } = useReports();
  const [reportType, setReportType] = useState<
    "vendas" | "captacoes" | "visitas" | "locacao" | "loteamentos"
  >("vendas");
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filtros
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [brokerId, setBrokerId] = useState("");
  const [origin, setOrigin] = useState("");
  const [campaign, setCampaign] = useState("");
  const [operation, setOperation] = useState("");
  const [developmentId, setDevelopmentId] = useState("");

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleApplyFilters = async () => {
    await loadReports({ startDate, endDate, brokerId, origin, campaign, operation, developmentId });
    setShowFilters(false);
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
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all"
        >
          <Filter className="w-4 h-4" />
          Filtros
        </button>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-bold text-white">Filtrar por:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-slate-400">Data Inicial</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Data Final</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Corretor (ID)</label>
              <input
                type="text"
                value={brokerId}
                onChange={(e) => setBrokerId(e.target.value)}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm"
                placeholder="ID do corretor"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Origem</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm"
                placeholder="Google Ads, Facebook, etc"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Campanha</label>
              <input
                type="text"
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm"
                placeholder="Nome da campanha"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Operação</label>
              <input
                type="text"
                value={operation}
                onChange={(e) => setOperation(e.target.value)}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm"
                placeholder="Venda/Locação"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Empreendimento (ID)</label>
              <input
                type="text"
                value={developmentId}
                onChange={(e) => setDevelopmentId(e.target.value)}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm"
                placeholder="ID do empreendimento"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded transition"
            >
              Aplicar Filtros
            </button>
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setBrokerId("");
                setOrigin("");
                setCampaign("");
                setOperation("");
                setDevelopmentId("");
                loadReports({});
                setShowFilters(false);
              }}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded transition"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      )}

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
                    VGV Total
                  </span>
                  <p className="text-xl font-black text-amber-400">
                    {formatCurrency(reports?.sales.vgv || 0)}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">
                    Honorários (6%)
                  </span>
                  <p className="text-xl font-black text-emerald-400">
                    {formatCurrency(reports?.sales.commissions || 0)}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">
                    Vendas
                  </span>
                  <p className="text-xl font-black text-white">
                    {reports?.sales.count || 0}
                  </p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-slate-800 rounded">
                    <p className="text-slate-400 text-xs">Ticket Médio</p>
                    <p className="text-white font-bold">{formatCurrency(reports?.sales.averageTicket || 0)}</p>
                  </div>
                  <div className="p-3 bg-slate-800 rounded">
                    <p className="text-slate-400 text-xs">Conversão</p>
                    <p className="text-emerald-400 font-bold">
                      {(reports?.sales.conversion || 0).toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800 rounded">
                    <p className="text-slate-400 text-xs">Período</p>
                    <p className="text-white font-bold text-xs">
                      {reports?.period.start ? new Date(reports.period.start).toLocaleDateString("pt-BR") : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REPORT: CAPTAÇÕES */}
          {reportType === "captacoes" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white">
                Portfólio de Captações ({reports?.properties.total || 0} imóveis)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Total</p>
                  <p className="text-white font-bold text-lg">{reports?.properties.total}</p>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Ativos</p>
                  <p className="text-emerald-400 font-bold text-lg">{reports?.properties.active}</p>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">%Ativo</p>
                  <p className="text-blue-400 font-bold text-lg">
                    {reports && reports.properties.total > 0
                      ? ((reports.properties.active / reports.properties.total) * 100).toFixed(0)
                      : "0"}
                    %
                  </p>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Período</p>
                  <p className="text-white font-bold text-xs">
                    {reports?.period.start ? new Date(reports.period.start).toLocaleDateString("pt-BR") : "—"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* REPORT: VISITAS */}
          {reportType === "visitas" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white">
                Visitação e Conversão
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Total de Visitas</p>
                  <p className="text-white font-bold text-lg">{reports?.visits.total}</p>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Completadas</p>
                  <p className="text-emerald-400 font-bold text-lg">{reports?.visits.completed}</p>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Taxa Conversão</p>
                  <p className="text-blue-400 font-bold text-lg">
                    {(reports?.visits.conversion || 0).toFixed(1)}%
                  </p>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Período</p>
                  <p className="text-white font-bold text-xs">
                    {reports?.period.start ? new Date(reports.period.start).toLocaleDateString("pt-BR") : "—"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* REPORT: LOCAÇÃO */}
          {reportType === "locacao" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white">
                Financeiro de Locações
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Locações Ativas
                  </span>
                  <p className="text-xl font-black text-white mt-2">{reports?.rentals.activeLeases}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Inadimplência
                  </span>
                  <p className="text-xl font-black text-rose-400 mt-2">
                    {reports?.rentals.overdueCharges || 0} atrasos
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-800 rounded-lg">
                <p className="text-slate-400 text-xs mb-2">Valores</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Montante Atrasado</p>
                    <p className="text-rose-400 font-bold">
                      {formatCurrency(reports?.rentals.overdueAmount || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Período</p>
                    <p className="text-white font-bold text-xs">
                      {reports?.period.start ? new Date(reports.period.start).toLocaleDateString("pt-BR") : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REPORT: LOTEAMENTOS */}
          {reportType === "loteamentos" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white">
                Developments e Lotes ({reports?.developments.developments || 0} empreendimentos)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Disponíveis</p>
                  <p className="text-emerald-400 font-bold text-lg">{reports?.developments.lotsAvailable}</p>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Reservados</p>
                  <p className="text-amber-400 font-bold text-lg">{reports?.developments.lotsReserved}</p>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Vendidos</p>
                  <p className="text-blue-400 font-bold text-lg">{reports?.developments.lotsSold}</p>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg col-span-2 md:col-span-3">
                  <p className="text-slate-400 text-xs mb-1">VGV Total</p>
                  <p className="text-white font-bold text-lg">
                    {formatCurrency(reports?.developments.vgv || 0)}
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
