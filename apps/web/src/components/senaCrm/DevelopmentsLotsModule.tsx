import React, { useState } from "react";
import {
  Trees,
  Grid,
  Calculator,
  Lock,
  Loader2,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { useLots } from "../../hooks/useLots";
import type { LotDto, LotSimulationDto } from "@sena/shared";

export const DevelopmentsLotsModule: React.FC<{ developmentId?: string }> = ({
  developmentId = "",
}) => {
  const { lots, loading, error, loadLots, reserveLot, simulateLot } = useLots();
  const [selectedLot, setSelectedLot] = useState<LotDto | null>(null);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [reservationClientId, setReservationClientId] = useState("");
  const [reservationExpires, setReservationExpires] = useState("");

  // Simulator state
  const [simLotPrice, setSimLotPrice] = useState<number>(380000);
  const [simDownPaymentPct, setSimDownPaymentPct] = useState<number>(15);
  const [simInstallments, setSimInstallments] = useState<number>(120);
  const [simInterestRate, setSimInterestRate] = useState<number>(0.85);

  // Load lots when development changes
  React.useEffect(() => {
    if (developmentId) {
      loadLots(developmentId);
    }
  }, [developmentId, loadLots]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 2,
    }).format(val);
  };

  const handleLotClick = (lot: LotDto) => {
    setSelectedLot(lot);
    setSimLotPrice(lot.basePrice);
  };

  const handleReserve = async () => {
    if (!selectedLot || !reservationClientId || !reservationExpires) {
      alert("Preencha todos os campos");
      return;
    }

    try {
      await reserveLot({
        lotId: selectedLot.id,
        clientId: reservationClientId,
        expiresAt: new Date(reservationExpires).toISOString(),
      });
      setShowReservationForm(false);
      setReservationClientId("");
      setReservationExpires("");
      alert("Lote reservado com sucesso");
    } catch (err) {
      alert(`Erro ao reservar: ${err instanceof Error ? err.message : "Desconhecido"}`);
    }
  };

  const handleSimulate = async () => {
    if (!selectedLot) return;

    try {
      const sim = await simulateLot({
        lotId: selectedLot.id,
        entryAmount: (simLotPrice * simDownPaymentPct) / 100,
        installments: simInstallments,
        interestRate: simInterestRate,
      });

      alert(
        `Simulação: ${formatCurrency(sim.installmentValue)}/mês por ${sim.installments} parcelas`
      );
    } catch (err) {
      alert(`Erro ao simular: ${err instanceof Error ? err.message : "Desconhecido"}`);
    }
  };

  // Simulator calculations
  const downPaymentVal = (simLotPrice * simDownPaymentPct) / 100;
  const balanceToFinance = simLotPrice - downPaymentVal;
  const i = simInterestRate / 100;
  const monthlyPayment =
    i > 0
      ? (balanceToFinance * (i * Math.pow(1 + i, simInstallments))) /
        (Math.pow(1 + i, simInstallments) - 1)
      : balanceToFinance / simInstallments;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "RESERVED":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "SOLD":
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "Disponível";
      case "RESERVED":
        return "Reservado";
      case "SOLD":
        return "Vendido";
      default:
        return status;
    }
  };

  if (!developmentId) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
        <p className="text-slate-400">Selecione um empreendimento para visualizar os lotes</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-1">
            <Trees className="w-4 h-4" />
            Empreendimentos e Lotes
          </div>
          <h2 className="text-lg font-bold text-white">Espelho de Vendas</h2>
          <p className="text-xs text-slate-400">
            {lots.length} lote{lots.length !== 1 ? "s" : ""} cadastrado{lots.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Error & Loading */}
      {error && (
        <div className="bg-rose-500/20 border border-rose-500/30 rounded-lg p-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span className="text-sm text-rose-300">{error}</span>
        </div>
      )}

      {/* Lots Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
        </div>
      ) : lots.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          Nenhum lote cadastrado neste empreendimento
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {lots.map((lot) => (
            <button
              key={lot.id}
              onClick={() => handleLotClick(lot)}
              className={`p-4 rounded-lg border text-left transition ${
                selectedLot?.id === lot.id
                  ? "bg-blue-500/20 border-blue-500/50"
                  : "bg-slate-800 border-slate-700 hover:border-blue-500/50"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-white">Lote {lot.lotNumber}</p>
                  <p className="text-xs text-slate-400">Quadra: {lot.blockId}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded border font-medium ${getStatusColor(
                    lot.status
                  )}`}
                >
                  {getStatusLabel(lot.status)}
                </span>
              </div>
              <div className="space-y-1 text-xs text-slate-400">
                <p>
                  Área: <strong className="text-white">{lot.areaM2.toFixed(2)}m²</strong>
                </p>
                <p>
                  Preço: <strong className="text-white">{formatCurrency(lot.basePrice)}</strong>
                </p>
                {lot.promotionalPrice && lot.promotionalPrice < lot.basePrice && (
                  <p className="text-emerald-400">
                    Promoção: {formatCurrency(lot.promotionalPrice)}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail Panel */}
      {selectedLot && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-4">
              Lote {selectedLot.lotNumber} - {getStatusLabel(selectedLot.status)}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Área</p>
                <p className="text-white font-semibold">{selectedLot.areaM2.toFixed(2)}m²</p>
              </div>
              <div>
                <p className="text-slate-400">Preço Base</p>
                <p className="text-white font-semibold">{formatCurrency(selectedLot.basePrice)}</p>
              </div>
              <div>
                <p className="text-slate-400">Entrada Mínima</p>
                <p className="text-white font-semibold">
                  {formatCurrency(selectedLot.minDownPayment)}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Parcelas</p>
                <p className="text-white font-semibold">até {selectedLot.maxInstallments}x</p>
              </div>
            </div>
          </div>

          {/* Reservation Button */}
          {selectedLot.status === "AVAILABLE" && (
            <div>
              {!showReservationForm ? (
                <button
                  onClick={() => setShowReservationForm(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Reservar Lote
                </button>
              ) : (
                <div className="space-y-3 p-4 bg-slate-800 rounded-lg">
                  <input
                    type="text"
                    placeholder="ID do Cliente"
                    value={reservationClientId}
                    onChange={(e) => setReservationClientId(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400"
                  />
                  <input
                    type="date"
                    value={reservationExpires}
                    onChange={(e) => setReservationExpires(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleReserve}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded font-semibold"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setShowReservationForm(false)}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded font-semibold"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Simulator */}
          <div>
            {!showSimulator ? (
              <button
                onClick={() => setShowSimulator(true)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 border border-slate-700"
              >
                <Calculator className="w-4 h-4" />
                Simular Financiamento
              </button>
            ) : (
              <div className="space-y-3 p-4 bg-slate-800 rounded-lg">
                <div>
                  <label className="text-xs text-slate-400">Preço: {formatCurrency(simLotPrice)}</label>
                  <input
                    type="range"
                    min="100000"
                    max="5000000"
                    step="10000"
                    value={simLotPrice}
                    onChange={(e) => setSimLotPrice(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-slate-400">Entrada %</label>
                    <input
                      type="number"
                      value={simDownPaymentPct}
                      onChange={(e) => setSimDownPaymentPct(Number(e.target.value))}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Parcelas</label>
                    <input
                      type="number"
                      value={simInstallments}
                      onChange={(e) => setSimInstallments(Number(e.target.value))}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                      max="360"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Taxa %</label>
                    <input
                      type="number"
                      value={simInterestRate}
                      onChange={(e) => setSimInterestRate(Number(e.target.value))}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-700 rounded">
                  <div>
                    <p className="text-xs text-slate-400">Entrada</p>
                    <p className="text-white font-semibold">{formatCurrency(downPaymentVal)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Parcela</p>
                    <p className="text-emerald-400 font-semibold">{formatCurrency(monthlyPayment)}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSimulate}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded font-semibold text-sm"
                  >
                    Salvar Simulação
                  </button>
                  <button
                    onClick={() => setShowSimulator(false)}
                    className="flex-1 bg-slate-600 hover:bg-slate-500 text-white px-3 py-2 rounded font-semibold text-sm"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
