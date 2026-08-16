import React, { useState } from "react";
import {
  DollarSign,
  PieChart as PieIcon,
  Calculator,
  CheckCircle2,
  Clock,
  ArrowRightLeft,
  Building,
  User,
  Sparkles,
  Sliders,
} from "lucide-react";
import { CommissionDistribution } from "../../types/senaCrm";

interface CommissionsModuleProps {
  commissions: CommissionDistribution[];
}

export const CommissionsModule: React.FC<CommissionsModuleProps> = ({ commissions }) => {
  // Interactive Simulator State
  const [simSaleValue, setSimSaleValue] = useState<number>(5000000);
  const [simTotalCommissionPct, setSimTotalCommissionPct] = useState<number>(6.0);
  const [simAgencyPct, setSimAgencyPct] = useState<number>(40.0);
  const [simManagerPct, setSimManagerPct] = useState<number>(10.0);
  const [simCaptatorPct, setSimCaptatorPct] = useState<number>(25.0);
  const [simAttendantPct, setSimAttendantPct] = useState<number>(25.0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Simulator Calculations
  const simTotalCommissionVal = (simSaleValue * simTotalCommissionPct) / 100;
  const simAgencyVal = (simTotalCommissionVal * simAgencyPct) / 100;
  const simManagerVal = (simTotalCommissionVal * simManagerPct) / 100;
  const simCaptatorVal = (simTotalCommissionVal * simCaptatorPct) / 100;
  const simAttendantVal = (simTotalCommissionVal * simAttendantPct) / 100;

  // Global Totals
  const totalCommissionValSum = commissions.reduce((acc, c) => acc + c.totalCommissionValue, 0);
  const agencyValSum = commissions.reduce((acc, c) => acc + c.agencyShareValue, 0);
  const brokersValSum = commissions.reduce(
    (acc, c) => acc + c.captatorShareValue + c.attendantBrokerShareValue,
    0
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <DollarSign className="w-4 h-4" />
            Engenharia de Comissões & Repartição
          </div>
          <h2 className="text-lg font-bold text-white">
            Módulo de Divisão Transparente de Comissões
          </h2>
          <p className="text-xs text-slate-400">
            Regras de split entre Imobiliária (40%), Gerência (10%), Captador (25%) e Corretor de
            Atendimento (25%)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">
              Total Distribuído
            </span>
            <span className="text-base font-black text-emerald-400">
              {formatCurrency(totalCommissionValSum)}
            </span>
          </div>
        </div>
      </div>

      {/* Simulator Card - Interactive Split Tool */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-amber-500/30 rounded-2xl p-5 lg:p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Simulador Interativo de Split de Honorários
              </h3>
              <p className="text-xs text-slate-400">
                Ajuste o valor da venda e veja o cálculo em tempo real
              </p>
            </div>
          </div>
          <span className="text-xs font-black text-slate-950 bg-amber-400 px-2.5 py-1 rounded-lg">
            Cálculo Automático
          </span>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Valor da Venda / Imóvel:</span>
                <span className="text-amber-400 font-bold">{formatCurrency(simSaleValue)}</span>
              </div>
              <input
                type="range"
                min="500000"
                max="25000000"
                step="250000"
                value={simSaleValue}
                onChange={(e) => setSimSaleValue(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Percentual de Honorários (Geral):</span>
                <span className="text-amber-400 font-bold">
                  {simTotalCommissionPct.toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="8"
                step="0.5"
                value={simTotalCommissionPct}
                onChange={(e) => setSimTotalCommissionPct(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold">COMISSÃO BRUTA GERADA:</span>
                <span className="text-lg font-black text-emerald-400">
                  {formatCurrency(simTotalCommissionVal)}
                </span>
              </div>
            </div>
          </div>

          {/* Split Output Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                Imobiliária SENA (40%)
              </span>
              <p className="text-sm font-black text-amber-300">{formatCurrency(simAgencyVal)}</p>
              <span className="text-[10px] text-slate-500 block">
                Estrutura, Marketing e Jurídico
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                Gerência Comercial (10%)
              </span>
              <p className="text-sm font-black text-blue-300">{formatCurrency(simManagerVal)}</p>
              <span className="text-[10px] text-slate-500 block">Acompanhamento e Fechamento</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                Corretor Captador (25%)
              </span>
              <p className="text-sm font-black text-emerald-300">
                {formatCurrency(simCaptatorVal)}
              </p>
              <span className="text-[10px] text-slate-500 block">Captação exclusiva do imóvel</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                Corretor Atendimento (25%)
              </span>
              <p className="text-sm font-black text-purple-300">
                {formatCurrency(simAttendantVal)}
              </p>
              <span className="text-[10px] text-slate-500 block">Atendimento do comprador</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real Historical Distributions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs space-y-3 p-5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white">
              Relatório de Comissões e Repasses Cadastrados
            </h3>
            <p className="text-xs text-slate-400">Detalhamento por venda concluída ou prevista</p>
          </div>
          <span className="text-xs text-slate-400">{commissions.length} registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3">Venda / Imóvel</th>
                <th className="py-3 px-3">VGV Venda</th>
                <th className="py-3 px-3">Comissão Total (6%)</th>
                <th className="py-3 px-3">Imobiliária</th>
                <th className="py-3 px-3">Gerência</th>
                <th className="py-3 px-3">Captador</th>
                <th className="py-3 px-3">Atendimento</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {commissions.map((c, idx) => (
                <tr key={idx} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-bold text-white block">{c.saleCode}</span>
                    <span className="text-[11px] text-slate-400 truncate block max-w-[200px]">
                      {c.propertyTitle}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-300">
                    {formatCurrency(c.saleValue)}
                  </td>
                  <td className="py-3 px-3 font-bold text-amber-400">
                    {formatCurrency(c.totalCommissionValue)}
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {formatCurrency(c.agencyShareValue)} ({c.agencySharePercentage}%)
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {formatCurrency(c.managerShareValue)} ({c.managerSharePercentage}%)
                  </td>
                  <td className="py-3 px-3 text-emerald-400 font-semibold">
                    {formatCurrency(c.captatorShareValue)} ({c.captatorSharePercentage}%)
                  </td>
                  <td className="py-3 px-3 text-purple-400 font-semibold">
                    {formatCurrency(c.attendantBrokerShareValue)} (
                    {c.attendantBrokerSharePercentage}%)
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        c.status === "Quitada"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
