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
import { useCommissions } from "../../hooks/useCommissions";
import { useSales } from "../../hooks/useSales";

interface CommissionsModuleProps {}

export const CommissionsModule: React.FC<CommissionsModuleProps> = () => {
  const { commissions, isLoading } = useCommissions();
  const { sales } = useSales();

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

  // Global Totals from real backend data
  const totalCommissionValSum = commissions.reduce((acc, c) => acc + c.totalValue, 0);

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

      {/* Real Commissions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs space-y-3 p-5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white">
              Comissões & Splits de Venda
            </h3>
            <p className="text-xs text-slate-400">Distribuição por recipiente (Agência, Gerente, Captador, Atendimento)</p>
          </div>
          <span className="text-xs text-slate-400">{commissions.length} vendas</span>
        </div>

        {isLoading ? (
          <div className="text-xs text-slate-400 py-8 text-center">Carregando comissões...</div>
        ) : commissions.length === 0 ? (
          <div className="text-xs text-slate-400 py-8 text-center">Nenhuma comissão registrada</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3">Venda ID</th>
                  <th className="py-3 px-3">Valor Base</th>
                  <th className="py-3 px-3">Total (%)</th>
                  <th className="py-3 px-3">Total (R$)</th>
                  <th className="py-3 px-3">Splits</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {commissions.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-white text-[11px] font-mono">{c.saleId}</span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-300">
                      {formatCurrency(c.baseValue)}
                    </td>
                    <td className="py-3 px-3 font-bold text-amber-400">
                      {c.totalPercentage}%
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-400">
                      {formatCurrency(c.totalValue)}
                    </td>
                    <td className="py-3 px-3 text-[10px] space-y-0.5">
                      {c.splits.map((split) => (
                        <div key={split.id} className="text-slate-400">
                          <span className="text-slate-300 font-semibold">{split.recipientType}</span>: {split.percentage}% ({formatCurrency(split.amount)})
                        </div>
                      ))}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.status === "PAID"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {c.status === "PAID" ? "Paga" : "Prevista"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
