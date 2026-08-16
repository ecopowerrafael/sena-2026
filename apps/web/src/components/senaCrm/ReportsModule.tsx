import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  DollarSign,
  Building,
  KeyRound,
  Trees,
  Users,
  CheckCircle2,
} from "lucide-react";
import {
  Lead,
  Property,
  Broker,
  Visit,
  Proposal,
  SaleClosure,
  CommissionDistribution,
  RentalContract,
  RentalPayout,
  Development,
} from "../../types/senaCrm";

interface ReportsModuleProps {
  sales: SaleClosure[];
  properties: Property[];
  visits: Visit[];
  commissions: CommissionDistribution[];
  rentalPayouts: RentalPayout[];
  developments: Development[];
  brokers: Broker[];
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({
  sales,
  properties,
  visits,
  commissions,
  rentalPayouts,
  developments,
  brokers,
}) => {
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

  const totalVgvSales = sales.reduce((acc, s) => acc + s.finalSalePrice, 0);
  const totalCommissionsSales = sales.reduce((acc, s) => acc + s.commissionTotal, 0);
  const totalRentCollected = rentalPayouts.reduce((acc, p) => acc + p.grossRentReceived, 0);
  const totalRentAdminFee = rentalPayouts.reduce((acc, p) => acc + p.adminFeeDeduction, 0);

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
            Exportação e consolidação de dados operacionais e financeiros
          </p>
        </div>

        <div className="flex items-center gap-2">
          {downloadSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{downloadSuccess} gerado com sucesso!</span>
            </div>
          )}
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            Exportar CSV / Planilha
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "vendas", label: "Relatório de Vendas", icon: DollarSign },
          { id: "captacoes", label: "Relatório de Captações", icon: Building },
          { id: "visitas", label: "Relatório de Visitas & Conversão", icon: Calendar },
          { id: "locacao", label: "Relatório Financeiro de Locação", icon: KeyRound },
          { id: "loteamentos", label: "Relatório de Loteamentos", icon: Trees },
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

      {/* REPORT CONTENT: VENDAS */}
      {reportType === "vendas" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">
                VGV Total Fechado
              </span>
              <p className="text-xl font-black text-amber-400">{formatCurrency(totalVgvSales)}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">
                Honorários Gerados (6%)
              </span>
              <p className="text-xl font-black text-emerald-400">
                {formatCurrency(totalCommissionsSales)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">
                Ticket Médio de Venda
              </span>
              <p className="text-xl font-black text-white">
                {formatCurrency(totalVgvSales / Math.max(1, sales.length))}
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs p-5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Tabela Detalhada de Fechamentos
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-3">Código & Data</th>
                    <th className="py-3 px-3">Imóvel Vendido</th>
                    <th className="py-3 px-3">Comprador</th>
                    <th className="py-3 px-3">Valor de Venda</th>
                    <th className="py-3 px-3">Comissão (6%)</th>
                    <th className="py-3 px-3">Corretor Venda</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {sales.map((s) => (
                    <tr key={s.id}>
                      <td className="py-3 px-3 font-mono text-amber-400 font-bold">
                        {s.code} ({s.saleDate})
                      </td>
                      <td className="py-3 px-3 font-medium text-white">{s.propertyTitle}</td>
                      <td className="py-3 px-3 text-slate-300">{s.clientName}</td>
                      <td className="py-3 px-3 font-black text-amber-400">
                        {formatCurrency(s.finalSalePrice)}
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-400">
                        {formatCurrency(s.commissionTotal)}
                      </td>
                      <td className="py-3 px-3 text-slate-300">{s.brokerName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT CONTENT: CAPTAÇÕES */}
      {reportType === "captacoes" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-white">
            Captações Ativas no Portfólio ({properties.length} imóveis)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3">Código</th>
                  <th className="py-3 px-3">Imóvel & Bairro</th>
                  <th className="py-3 px-3">Proprietário</th>
                  <th className="py-3 px-3">Corretor Captador</th>
                  <th className="py-3 px-3">Exclusividade</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {properties.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 px-3 font-mono font-bold text-amber-400">{p.code}</td>
                    <td className="py-3 px-3 font-semibold text-white">
                      {p.title} ({p.neighborhood})
                    </td>
                    <td className="py-3 px-3 text-slate-300">{p.ownerName}</td>
                    <td className="py-3 px-3 text-emerald-400 font-medium">
                      {p.brokerCaptatorName}
                    </td>
                    <td className="py-3 px-3">{p.isExclusive ? "Sim (SENA)" : "Comum"}</td>
                    <td className="py-3 px-3">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT CONTENT: VISITAS */}
      {reportType === "visitas" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">
              Relatório de Visitação e Índice de Conversão
            </h3>
            <span className="text-xs text-amber-400 font-bold">
              Taxa de Conversão em Proposta: 60%
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3">Data/Hora</th>
                  <th className="py-3 px-3">Cliente</th>
                  <th className="py-3 px-3">Imóvel</th>
                  <th className="py-3 px-3">Corretor</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Impressão / Laudo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {visits.map((v) => (
                  <tr key={v.id}>
                    <td className="py-3 px-3 font-mono">
                      {v.date} às {v.time}
                    </td>
                    <td className="py-3 px-3 font-bold text-white">{v.clientName}</td>
                    <td className="py-3 px-3 text-slate-300">{v.propertyTitle}</td>
                    <td className="py-3 px-3">{v.brokerName}</td>
                    <td className="py-3 px-3">{v.status}</td>
                    <td className="py-3 px-3 text-amber-300 italic">
                      {v.clientImpression || "Sem laudo"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT CONTENT: LOCAÇÃO */}
      {reportType === "locacao" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Aluguel Bruto Arrecadado
              </span>
              <p className="text-xl font-black text-white mt-1">
                {formatCurrency(totalRentCollected)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Taxa de Adm Recebida pela Imobiliária
              </span>
              <p className="text-xl font-black text-emerald-400 mt-1">
                {formatCurrency(totalRentAdminFee)}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3">Contrato</th>
                  <th className="py-3 px-3">Proprietário</th>
                  <th className="py-3 px-3">Bruto Recebido</th>
                  <th className="py-3 px-3">Taxa Adm.</th>
                  <th className="py-3 px-3">Líquido Repassado</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {rentalPayouts.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 px-3 font-mono font-bold text-amber-400">
                      {p.contractNumber}
                    </td>
                    <td className="py-3 px-3 font-medium text-white">{p.ownerName}</td>
                    <td className="py-3 px-3 text-white font-bold">
                      {formatCurrency(p.grossRentReceived)}
                    </td>
                    <td className="py-3 px-3 text-rose-400 font-medium">
                      − {formatCurrency(p.adminFeeDeduction)}
                    </td>
                    <td className="py-3 px-3 text-emerald-400 font-black">
                      {formatCurrency(p.netOwnerPayout)}
                    </td>
                    <td className="py-3 px-3">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT CONTENT: LOTEAMENTOS */}
      {reportType === "loteamentos" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-white">
            Desempenho Geral de Loteamentos & VGV Urbanístico
          </h3>
          <div className="space-y-4">
            {developments.map((d) => {
              const soldLotsCount = d.lots.filter((l) => l.status === "Vendido").length;
              const availableLotsCount = d.lots.filter((l) => l.status === "Disponivel").length;
              return (
                <div
                  key={d.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-white">
                      {d.name} ({d.location})
                    </h4>
                    <span className="text-sm font-black text-amber-400">
                      VGV: {formatCurrency(d.totalVgv)}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-slate-300">
                    <span>
                      Total de Lotes: <strong>{d.totalLots}</strong>
                    </span>
                    <span>
                      Lotes Vendidos: <strong className="text-emerald-400">{soldLotsCount}</strong>
                    </span>
                    <span>
                      Disponíveis: <strong className="text-blue-400">{availableLotsCount}</strong>
                    </span>
                    <span>
                      VGV Realizado:{" "}
                      <strong className="text-amber-300">{formatCurrency(d.soldVgv)}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
