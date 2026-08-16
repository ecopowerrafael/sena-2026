import React, { useState } from "react";
import {
  Trees,
  Layers,
  Grid,
  Calculator,
  CheckCircle2,
  Lock,
  Clock,
  Sparkles,
  DollarSign,
  MapPin,
  Maximize2,
  Tag,
  ArrowRight,
  Sliders,
  Plus,
} from "lucide-react";
import { Development, Lot, LotStatus } from "../../types/senaCrm";

interface DevelopmentsLotsModuleProps {
  developments: Development[];
  onUpdateLotStatus: (devId: string, lotId: string, newStatus: LotStatus, buyerInfo?: any) => void;
}

export const DevelopmentsLotsModule: React.FC<DevelopmentsLotsModuleProps> = ({
  developments,
  onUpdateLotStatus,
}) => {
  const [selectedDevId, setSelectedDevId] = useState<string>(developments[0]?.id || "");
  const [selectedBlockFilter, setSelectedBlockFilter] = useState<string>("all");
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);

  // Lot Status Change Modal State
  const [newStatusChoice, setNewStatusChoice] = useState<LotStatus>("Reservado");
  const [buyerNameInput, setBuyerNameInput] = useState("");

  // Direct Land Installment Simulator State
  const [simLotPrice, setSimLotPrice] = useState<number>(380000);
  const [simDownPaymentPct, setSimDownPaymentPct] = useState<number>(15);
  const [simInstallmentsCount, setSimInstallmentsCount] = useState<number>(120);
  const [simInterestRateMonthly, setSimInterestRateMonthly] = useState<number>(0.85); // 0.85% a.m.
  const [simBalloonAnnualsCount, setSimBalloonAnnualsCount] = useState<number>(5);
  const [simBalloonValue, setSimBalloonValue] = useState<number>(15000);

  const currentDev = developments.find((d) => d.id === selectedDevId) || developments[0];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Filter lots by block
  const filteredLots = (currentDev?.lots || []).filter((lot) => {
    if (selectedBlockFilter === "all") return true;
    return lot.block === selectedBlockFilter;
  });

  // Simulator Calculations (Price table with direct installment amortization)
  const simDownPaymentVal = (simLotPrice * simDownPaymentPct) / 100;
  const totalBalloonsSum = simBalloonAnnualsCount * simBalloonValue;
  const balanceToFinance = Math.max(0, simLotPrice - simDownPaymentVal - totalBalloonsSum);

  // Monthly payment calculation with interest formula: PMT = PV * [i * (1 + i)^n] / [(1 + i)^n - 1]
  const i = simInterestRateMonthly / 100;
  const n = simInstallmentsCount;
  const monthlyPaymentVal =
    i > 0
      ? (balanceToFinance * (i * Math.pow(1 + i, n))) / (Math.pow(1 + i, n) - 1)
      : balanceToFinance / n;

  const handleLotClick = (lot: Lot) => {
    setSelectedLot(lot);
    setSimLotPrice(lot.basePrice);
    setNewStatusChoice(lot.status);
    setBuyerNameInput(lot.reservedByClientName || "");
  };

  const handleSaveLotStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLot || !currentDev) return;

    onUpdateLotStatus(currentDev.id, selectedLot.id, newStatusChoice, {
      reservedBy:
        newStatusChoice !== "Disponivel" ? buyerNameInput || "Cliente Reserva" : undefined,
    });

    // update local selected
    setSelectedLot({
      ...selectedLot,
      status: newStatusChoice,
      reservedByClientName: newStatusChoice !== "Disponivel" ? buyerNameInput : undefined,
    });
  };

  const getLotStatusColor = (status: LotStatus) => {
    switch (status) {
      case "Disponivel":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30";
      case "Reservado":
        return "bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30";
      case "Em Proposta":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30";
      case "Vendido":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30";
      case "Bloqueado":
        return "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  // Distinct blocks in current development
  const availableBlocks = Array.from(new Set(currentDev?.lots.map((l) => l.block) || []));

  return (
    <div className="space-y-6 pb-12">
      {/* Development Selector & Summary KPI Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <Trees className="w-4 h-4" />
              Loteamentos, Lançamentos & Urbanismo
            </div>
            <h2 className="text-lg font-bold text-white">Espelho de Vendas & Gestão de Quadras</h2>
            <p className="text-xs text-slate-400">
              {currentDev?.name} — {currentDev?.location}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Development dropdown */}
            <select
              value={selectedDevId}
              onChange={(e) => setSelectedDevId(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
            >
              {developments.map((dev) => (
                <option key={dev.id} value={dev.id}>
                  {dev.name} ({dev.location})
                </option>
              ))}
            </select>

            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">
                VGV Estimado
              </span>
              <span className="text-sm font-black text-amber-400">
                {formatCurrency(currentDev?.totalVgv || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Development Summary KPI Bar */}
        {currentDev && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Total de Lotes:</span>
              <strong className="text-white text-sm">{currentDev.totalLots} unidades</strong>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Lotes Disponíveis:</span>
              <strong className="text-emerald-400 text-sm">
                {currentDev.lots.filter((l) => l.status === "Disponivel").length} lotes
              </strong>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Lotes Vendidos:</span>
              <strong className="text-rose-400 text-sm">
                {currentDev.lots.filter((l) => l.status === "Vendido").length} lotes
              </strong>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Previsão de Entrega:</span>
              <strong className="text-amber-400 text-sm">{currentDev.deliveryForecast}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Interactive Mirror of Lots (Left) + Detail/Simulator (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Espelho de Vendas (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
          {/* Header & Status Legend */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-bold text-white">Espelho de Vendas da Planta</h3>
              <span className="text-xs text-slate-400">Clique em qualquer lote para interagir</span>
            </div>

            {/* Block filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-medium">Quadra:</span>
              <select
                value={selectedBlockFilter}
                onChange={(e) => setSelectedBlockFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
              >
                <option value="all">Todas as Quadras</option>
                {availableBlocks.map((blk) => (
                  <option key={blk} value={blk}>
                    Quadra {blk}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Legend Bar */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-slate-300">Disponível</span>
            </div>
            <div className="flex items-center gap-1.5 ml-2">
              <span className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-slate-300">Reservado</span>
            </div>
            <div className="flex items-center gap-1.5 ml-2">
              <span className="w-3 h-3 rounded bg-amber-500" />
              <span className="text-slate-300">Em Proposta</span>
            </div>
            <div className="flex items-center gap-1.5 ml-2">
              <span className="w-3 h-3 rounded bg-rose-500" />
              <span className="text-slate-300">Vendido</span>
            </div>
            <div className="flex items-center gap-1.5 ml-2">
              <span className="w-3 h-3 rounded bg-slate-600" />
              <span className="text-slate-400">Bloqueado</span>
            </div>
          </div>

          {/* Interactive Lot Grid Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
            {filteredLots.map((lot) => {
              const isSelected = selectedLot?.id === lot.id;
              const pricePerM2 = lot.areaM2 > 0 ? Math.round(lot.basePrice / lot.areaM2) : 0;
              return (
                <div
                  key={lot.id}
                  onClick={() => handleLotClick(lot)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-32 ${getLotStatusColor(
                    lot.status
                  )} ${isSelected ? "ring-2 ring-amber-400 shadow-lg scale-102" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black">
                      QD {lot.block} • LT {lot.lotNumber}
                    </span>
                    <span className="text-[10px] font-bold uppercase">{lot.status}</span>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold">{lot.areaM2}m²</div>
                    <div className="text-xs font-black mt-0.5">{formatCurrency(lot.basePrice)}</div>
                  </div>

                  <div className="text-[9px] text-slate-300/80 truncate">
                    {lot.reservedByClientName
                      ? `👤 ${lot.reservedByClientName}`
                      : `R$ ${pricePerM2}/m²`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Lot Detail, Status Update & Direct Simulator (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Selected Lot Panel */}
          {selectedLot ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 className="font-black text-sm text-white">
                    Quadra {selectedLot.block} — Lote {selectedLot.lotNumber}
                  </h4>
                  <p className="text-xs text-slate-400">{currentDev.name}</p>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950">
                  {selectedLot.areaM2} m²
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Valor de Tabela:</span>
                  <strong className="text-amber-400 font-bold text-sm">
                    {formatCurrency(selectedLot.basePrice)}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Valor por m²:</span>
                  <strong className="text-white">
                    {formatCurrency(
                      selectedLot.areaM2 > 0 ? selectedLot.basePrice / selectedLot.areaM2 : 0
                    )}
                    /m²
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status Atual:</span>
                  <span className="font-bold text-white">{selectedLot.status}</span>
                </div>
                {selectedLot.reservedByClientName && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Titular / Reserva:</span>
                    <strong className="text-emerald-400">{selectedLot.reservedByClientName}</strong>
                  </div>
                )}
              </div>

              {/* Status Change Form */}
              <form
                onSubmit={handleSaveLotStatus}
                className="pt-3 border-t border-slate-800 space-y-3 text-xs"
              >
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Alterar Status do Lote:
                  </label>
                  <select
                    value={newStatusChoice}
                    onChange={(e) => setNewStatusChoice(e.target.value as LotStatus)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold"
                  >
                    <option value="Disponivel">Disponível</option>
                    <option value="Reservado">Reservado</option>
                    <option value="Em Proposta">Em Proposta</option>
                    <option value="Vendido">Vendido</option>
                    <option value="Bloqueado">Bloqueado</option>
                  </select>
                </div>

                {newStatusChoice !== "Disponivel" && (
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">
                      Nome do Comprador / Titular:
                    </label>
                    <input
                      type="text"
                      value={buyerNameInput}
                      onChange={(e) => setBuyerNameInput(e.target.value)}
                      placeholder="Ex: Carlos Eduardo Silveira"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md"
                >
                  Salvar Alteração de Status
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400">
              Selecione um lote no espelho para visualizar especificações ou alterar status.
            </div>
          )}

          {/* Direct Land Financing Simulator Tool */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Calculator className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Simulador Direto com a Loteadora
              </h4>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Entrada ({simDownPaymentPct}%):</span>
                  <span className="text-amber-400 font-bold">
                    {formatCurrency(simDownPaymentVal)}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="40"
                  step="5"
                  value={simDownPaymentPct}
                  onChange={(e) => setSimDownPaymentPct(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Prazo ({simInstallmentsCount} meses):</span>
                  <span className="text-white font-bold">{simInstallmentsCount}x parcelas</span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="180"
                  step="12"
                  value={simInstallmentsCount}
                  onChange={(e) => setSimInstallmentsCount(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Juros Financiamento Direto:</span>
                  <span className="text-white font-bold">
                    {simInterestRateMonthly}% a.m. + IPCA
                  </span>
                </div>
              </div>

              {/* Simulation Result Box */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  PARCELA MENSAL ESTIMADA:
                </span>
                <span className="text-lg font-black text-emerald-400 block">
                  {formatCurrency(monthlyPaymentVal)}{" "}
                  <span className="text-xs text-slate-400 font-normal">/mês</span>
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Plano com {simInstallmentsCount} parcelas mensais + correção anual por IPCA.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
