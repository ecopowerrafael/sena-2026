import React, { useState } from "react";
import {
  KeyRound,
  FileText,
  DollarSign,
  AlertTriangle,
  Plus,
  Loader2,
} from "lucide-react";
import { useLeases } from "../../hooks/useLeases";
import { useCharges } from "../../hooks/useCharges";

export const RentalsModule: React.FC = () => {
  const { leases, loading: leasesLoading, error: leasesError, loadLeases } = useLeases();
  const { charges, payouts, loading: chargesLoading, loadCharges, loadPayouts } = useCharges();
  const [selectedLeaseId, setSelectedLeaseId] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<"contratos" | "cobranças" | "repasses">("contratos");

  const selectedLease = selectedLeaseId ? leases.find((l) => l.id === selectedLeaseId) : null;

  // Load charges and payouts when lease is selected
  React.useEffect(() => {
    if (selectedLeaseId) {
      loadCharges(selectedLeaseId);
      loadPayouts(selectedLeaseId);
    }
  }, [selectedLeaseId, loadCharges, loadPayouts]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 2,
    }).format(val);
  };

  const getChargeStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "PENDING":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "OVERDUE":
      case "PARTIAL":
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  const totalMonthlyAdministered = leases.reduce(
    (acc, lease) => acc + lease.monthlyRent,
    0
  );

  const totalAdminFees = leases.reduce(
    (acc, lease) => acc + (lease.monthlyRent * lease.adminFeePercentage) / 100,
    0
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <KeyRound className="w-4 h-4" />
            Administração de Locações
          </div>
          <h2 className="text-lg font-bold text-white">Contratos & Repasses</h2>
          <p className="text-xs text-slate-400">
            Carteira ativa:{" "}
            <strong className="text-amber-300">{formatCurrency(totalMonthlyAdministered)}/mês</strong> •
            Taxa adm:{" "}
            <strong className="text-emerald-400">{formatCurrency(totalAdminFees)}/mês</strong>
          </p>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex gap-2 border-b border-slate-800">
        {(["contratos", "cobranças", "repasses"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`px-4 py-2 font-semibold text-sm border-b-2 transition ${
              subTab === tab
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            {tab === "contratos" && "📋 Contratos"}
            {tab === "cobranças" && "💰 Cobranças"}
            {tab === "repasses" && "🏦 Repasses"}
          </button>
        ))}
      </div>

      {/* Error & Loading */}
      {(leasesError || chargesLoading) && (
        <div className="bg-rose-500/20 border border-rose-500/30 rounded-lg p-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span className="text-sm text-rose-300">
            {leasesError || "Carregando dados..."}
          </span>
        </div>
      )}

      {/* CONTRATOS TAB */}
      {subTab === "contratos" && (
        <div className="space-y-4">
          {leasesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            </div>
          ) : leases.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              Nenhum contrato cadastrado
            </div>
          ) : (
            <div className="grid gap-3">
              {leases.map((lease) => (
                <button
                  key={lease.id}
                  onClick={() => {
                    setSelectedLeaseId(lease.id);
                    setSubTab("cobranças");
                  }}
                  className={`p-4 rounded-lg border text-left transition ${
                    selectedLeaseId === lease.id
                      ? "bg-amber-500/20 border-amber-500/50"
                      : "bg-slate-800 border-slate-700 hover:border-amber-500/50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-white">{lease.contractNumber}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Aluguel: {formatCurrency(lease.monthlyRent)} • Taxa adm: {lease.adminFeePercentage}%
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(lease.startDate).toLocaleDateString("pt-BR")} até{" "}
                        {new Date(lease.endDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded border ${
                      lease.status === "ACTIVE"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-slate-700 text-slate-300 border-slate-600"
                    }`}>
                      {lease.status === "ACTIVE" ? "Ativo" : lease.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* COBRANÇAS TAB */}
      {subTab === "cobranças" && (
        <div className="space-y-4">
          {!selectedLease ? (
            <div className="text-center py-8 text-slate-400">
              Selecione um contrato para ver cobranças
            </div>
          ) : chargesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            </div>
          ) : charges.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              Nenhuma cobrança para este contrato
            </div>
          ) : (
            <div className="grid gap-3">
              {charges.map((charge) => (
                <div
                  key={charge.id}
                  className="p-4 bg-slate-800 border border-slate-700 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-white">
                        Competência: {charge.competence}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Vencimento: {new Date(charge.dueDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded border ${getChargeStatusBadge(charge.status)}`}>
                      {charge.status === "PAID"
                        ? "Pago"
                        : charge.status === "PENDING"
                          ? "Pendente"
                          : charge.status === "OVERDUE"
                            ? "Vencido"
                            : charge.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                    <div>Aluguel: {formatCurrency(charge.rentAmount)}</div>
                    <div>Taxa: {formatCurrency(charge.condoAmount)}</div>
                    <div className="col-span-2 font-semibold text-white border-t border-slate-700 pt-2">
                      Total: {formatCurrency(charge.totalAmount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REPASSES TAB */}
      {subTab === "repasses" && (
        <div className="space-y-4">
          {!selectedLease ? (
            <div className="text-center py-8 text-slate-400">
              Selecione um contrato para ver repasses
            </div>
          ) : chargesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            </div>
          ) : payouts.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              Nenhum repasse para este contrato
            </div>
          ) : (
            <div className="grid gap-3">
              {payouts.map((payout) => (
                <div
                  key={payout.id}
                  className="p-4 bg-slate-800 border border-slate-700 rounded-lg"
                >
                  <p className="font-semibold text-white mb-2">
                    {payout.competence}
                  </p>
                  <div className="space-y-1 text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span>Aluguel recebido:</span>
                      <span className="text-white">{formatCurrency(payout.rentAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa adm:</span>
                      <span className="text-rose-400">-{formatCurrency(payout.adminFeeAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Despesas:</span>
                      <span className="text-rose-400">-{formatCurrency(payout.expensesAmount)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-700 pt-2 mt-2 font-semibold text-emerald-400">
                      <span>Líquido p/ proprietário:</span>
                      <span>{formatCurrency(payout.netAmount)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
