import React, { useState } from "react";
import {
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Plus,
  ArrowRight,
  ShieldCheck,
  Building,
  User,
  Sparkles,
  Award,
  FileCheck,
  AlertCircle,
  X,
} from "lucide-react";
import type { Property } from "../../types/senaCrm";
import { useProposals, type Proposal } from "../../hooks/useProposals";
import { useSales } from "../../hooks/useSales";
import { useCommissions } from "../../hooks/useCommissions";
import { useClients } from "../../hooks/useClients";
import { useProperties } from "../../hooks/useProperties";

interface ProposalsSalesModuleProps {
  properties: Property[];
}

export const ProposalsSalesModule: React.FC<ProposalsSalesModuleProps> = ({
  properties,
}) => {
  const { proposals, isLoading: proposalsLoading, createProposal, updateProposal, approveProposal } = useProposals();
  const { sales, isLoading: salesLoading, reload: reloadSales } = useSales();
  const { commissions } = useCommissions();
  const { clients } = useClients();
  const hookProperties = useProperties();

  const [activeTab, setActiveTab] = useState<"proposals" | "sales">("proposals");
  const [isNewProposalModalOpen, setIsNewProposalModalOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [proposalToClose, setProposalToClose] = useState<Proposal | null>(null);
  const [proposalForCounter, setProposalForCounter] = useState<Proposal | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New Proposal Form
  const [newProposalForm, setNewProposalForm] = useState({
    clientId: "",
    propertyId: "",
    proposedPrice: 4500000,
    downPayment: 1000000,
    paymentDescription: "Entrada de recursos próprios + Financiamento Bancário.",
  });

  // Counter proposal form
  const [counterPrice, setCounterPrice] = useState(4700000);
  const [counterNotes, setCounterNotes] = useState("");

  // Sale closure modal form
  const [saleForm, setSaleForm] = useState({
    paymentType: "Financiamento Bancário",
    contractNumber: "",
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!newProposalForm.clientId || !newProposalForm.propertyId) {
      setErrorMessage("Cliente e Imóvel são obrigatórios");
      return;
    }

    try {
      setIsModalLoading(true);
      const prop = hookProperties.properties.find((p) => p.id === newProposalForm.propertyId);

      await createProposal({
        clientId: newProposalForm.clientId,
        propertyId: newProposalForm.propertyId,
        advertisedPrice: prop?.salePrice || 5000000,
        proposedPrice: newProposalForm.proposedPrice,
        downPayment: newProposalForm.downPayment,
        paymentDescription: newProposalForm.paymentDescription,
      });

      setIsNewProposalModalOpen(false);
      setNewProposalForm({
        clientId: "",
        propertyId: "",
        proposedPrice: 4500000,
        downPayment: 1000000,
        paymentDescription: "Entrada de recursos próprios + Financiamento Bancário.",
      });
    } catch (err) {
      console.error("Failed to create proposal:", err);
      setErrorMessage(err instanceof Error ? err.message : "Erro ao criar proposta");
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleConfirmSaleClosure = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!proposalToClose || !saleForm.contractNumber) {
      setErrorMessage("Número de contrato é obrigatório");
      return;
    }

    try {
      setIsModalLoading(true);
      const finalPrice = proposalToClose.counterProposalPrice || proposalToClose.proposedPrice;

      await approveProposal(proposalToClose.id, {
        finalSalePrice: finalPrice,
        saleDate: new Date().toISOString().split("T")[0],
        paymentType: saleForm.paymentType,
        contractNumber: saleForm.contractNumber,
      });

      setProposalToClose(null);
      setSaleForm({ paymentType: "Financiamento Bancário", contractNumber: "" });
      await reloadSales();
    } catch (err) {
      console.error("Failed to approve proposal:", err);
      setErrorMessage(err instanceof Error ? err.message : "Erro ao fechar venda");
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleConfirmCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!proposalForCounter || !counterNotes.trim()) {
      setErrorMessage("Notas da contraproposta são obrigatórias");
      return;
    }

    try {
      setIsModalLoading(true);
      await updateProposal(proposalForCounter.id, {
        counterProposalPrice: counterPrice,
        counterProposalNotes: counterNotes,
        status: "COUNTER_PROPOSED",
      });

      setProposalForCounter(null);
      setCounterPrice(0);
      setCounterNotes("");
    } catch (err) {
      console.error("Failed to send counter proposal:", err);
      setErrorMessage(err instanceof Error ? err.message : "Erro ao enviar contraproposta");
    } finally {
      setIsModalLoading(false);
    }
  };

  const getClientName = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.name || "---";
  };

  const getPropertyName = (propId: string) => {
    return hookProperties.properties.find((p) => p.id === propId)?.title || "---";
  };

  const getSaleCommission = (saleId: string) => {
    const commission = commissions.find((c) => c.saleId === saleId);
    return commission?.totalValue || 0;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Toggle */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <DollarSign className="w-4 h-4" />
            Módulo de Negociações & Fechamentos
          </div>
          <h2 className="text-lg font-bold text-white">Propostas Comerciais & Vendas Fechadas</h2>
          <p className="text-xs text-slate-400">
            Fluxo de análise de propostas, contrapropostas e emissão de contratos de venda
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center">
            <button
              onClick={() => setActiveTab("proposals")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "proposals"
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Propostas Ativas ({proposals.length})
            </button>
            <button
              onClick={() => setActiveTab("sales")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "sales"
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Fechamentos Realizados ({sales.length})
            </button>
          </div>

          <button
            onClick={() => setIsNewProposalModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Nova Proposta
          </button>
        </div>
      </div>

      {activeTab === "proposals" ? (
        <div className="space-y-4">
          {proposalsLoading ? (
            <div className="text-xs text-slate-400 py-8 text-center">Carregando propostas...</div>
          ) : proposals.length === 0 ? (
            <div className="text-xs text-slate-400 py-8 text-center">Nenhuma proposta registrada</div>
          ) : (
            proposals.map((propDeal) => {
              const difference = propDeal.proposedPrice - propDeal.advertisedPrice;
              const diffPercent = ((difference / propDeal.advertisedPrice) * 100).toFixed(1);
              const statusDisplay =
                propDeal.status === "COUNTER_PROPOSED"
                  ? "Contraproposta Enviada"
                  : propDeal.status === "APPROVED"
                    ? "Aceita - Vendida"
                    : propDeal.status === "SUBMITTED"
                      ? "Submetida"
                      : propDeal.status === "DRAFT"
                        ? "Rascunho"
                        : propDeal.status;

              return (
                <div
                  key={propDeal.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs space-y-4"
                >
                  {/* Header Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 font-extrabold text-xs border border-amber-500/30">
                        {propDeal.code}
                      </span>
                      <h3 className="font-bold text-sm text-white">{getClientName(propDeal.clientId)}</h3>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                        propDeal.status === "APPROVED"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : propDeal.status === "COUNTER_PROPOSED"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}
                    >
                      {statusDisplay}
                    </span>
                  </div>

                  {/* Property & Value Breakdown Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div className="md:col-span-2 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        Imóvel
                      </span>
                      <p className="font-bold text-white text-sm">
                        {getPropertyName(propDeal.propertyId)}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        Valor Anunciado
                      </span>
                      <p className="text-slate-300 line-through font-semibold text-sm">
                        {formatCurrency(propDeal.advertisedPrice)}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">
                        Valor Proposto
                      </span>
                      <p className="text-amber-300 font-black text-base">
                        {formatCurrency(propDeal.proposedPrice)}
                      </p>
                      <span
                        className={`text-[10px] font-bold ${difference < 0 ? "text-rose-400" : "text-emerald-400"}`}
                      >
                        {diffPercent}%
                      </span>
                    </div>
                  </div>

                  {/* Payment & Counter */}
                  <div className="p-3 bg-slate-850/60 rounded-xl border border-slate-800 text-xs">
                    <span className="font-bold text-slate-200 block mb-1">Condição de Pagamento:</span>
                    <p className="text-slate-300">{propDeal.paymentDescription || "---"}</p>
                    {propDeal.counterProposalPrice && (
                      <div className="mt-2 pt-2 border-t border-slate-750 text-amber-300">
                        <strong>Contraproposta:</strong> {formatCurrency(propDeal.counterProposalPrice)}
                        {propDeal.counterProposalNotes && ` — ${propDeal.counterProposalNotes}`}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {propDeal.status !== "APPROVED" && (
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setProposalForCounter(propDeal);
                          setCounterPrice(propDeal.proposedPrice + 100000);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                      >
                        Enviar Contraproposta
                      </button>

                      <button
                        onClick={() => {
                          setProposalToClose(propDeal);
                          setSaleForm({ paymentType: "Financiamento Bancário", contractNumber: "" });
                        }}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                        Aprovar & Fechar
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {salesLoading ? (
            <div className="text-xs text-slate-400 py-8 text-center">Carregando vendas...</div>
          ) : sales.length === 0 ? (
            <div className="text-xs text-slate-400 py-8 text-center">Nenhuma venda registrada</div>
          ) : (
            sales.map((sale) => {
              const commission = getSaleCommission(sale.id);
              return (
                <div
                  key={sale.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-extrabold text-xs border border-emerald-500/30">
                      {sale.code}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {new Date(sale.saleDate).toLocaleDateString("pt-BR")}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-white">{getPropertyName(sale.propertyId)}</h4>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Comprador:</span>
                      <strong className="text-white">{getClientName(sale.buyerClientId)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Forma de Pagamento:</span>
                      <strong className="text-emerald-400">{sale.paymentType}</strong>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-850">
                      <span className="text-slate-400">Contrato:</span>
                      <span className="font-mono text-slate-300 text-[11px]">
                        {sale.contractNumber || "---"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Valor Final</span>
                      <span className="text-base font-black text-amber-400">
                        {formatCurrency(sale.finalSalePrice)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Comissão (6%)</span>
                      <span className="text-sm font-black text-emerald-400">
                        {formatCurrency(commission)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal: New Proposal */}
      {isNewProposalModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Cadastrar Nova Proposta</h3>
              <button
                onClick={() => setIsNewProposalModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-2 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateProposal} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Cliente *</label>
                <select
                  value={newProposalForm.clientId}
                  onChange={(e) =>
                    setNewProposalForm((p) => ({ ...p, clientId: e.target.value }))
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  required
                >
                  <option value="">Selecione um cliente...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Imóvel *</label>
                <select
                  value={newProposalForm.propertyId}
                  onChange={(e) =>
                    setNewProposalForm((p) => ({ ...p, propertyId: e.target.value }))
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  required
                >
                  <option value="">Selecione um imóvel...</option>
                  {hookProperties.properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({formatCurrency(p.salePrice)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Valor Proposto (R$) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newProposalForm.proposedPrice}
                    onChange={(e) =>
                      setNewProposalForm((p) => ({
                        ...p,
                        proposedPrice: Number(e.target.value),
                      }))
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Entrada (R$)</label>
                  <input
                    type="number"
                    value={newProposalForm.downPayment}
                    onChange={(e) =>
                      setNewProposalForm((p) => ({
                        ...p,
                        downPayment: Number(e.target.value),
                      }))
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Condições de Pagamento
                </label>
                <textarea
                  rows={2}
                  value={newProposalForm.paymentDescription}
                  onChange={(e) =>
                    setNewProposalForm((p) => ({
                      ...p,
                      paymentDescription: e.target.value,
                    }))
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewProposalModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isModalLoading}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold disabled:opacity-50"
                >
                  {isModalLoading ? "..." : "Registrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Sale Closure */}
      {proposalToClose && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
              <div>
                <h3 className="text-base font-bold text-white">Efetivar Fechamento de Venda</h3>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <p className="font-bold text-white">{getPropertyName(proposalToClose.propertyId)}</p>
              <p className="text-amber-400 font-bold">
                Valor Final:{" "}
                {formatCurrency(
                  proposalToClose.counterProposalPrice || proposalToClose.proposedPrice
                )}
              </p>
              <p className="text-slate-400">Comprador: {getClientName(proposalToClose.clientId)}</p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-2 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleConfirmSaleClosure} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Forma de Pagamento
                </label>
                <select
                  value={saleForm.paymentType}
                  onChange={(e) =>
                    setSaleForm((p) => ({ ...p, paymentType: e.target.value }))
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Financiamento Bancário">Financiamento Bancário</option>
                  <option value="À Vista TED/PIX">À Vista TED/PIX</option>
                  <option value="Parcelamento Direto">Parcelamento Direto</option>
                  <option value="Permuta">Permuta</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Número do Contrato / CCV *
                </label>
                <input
                  type="text"
                  required
                  value={saleForm.contractNumber}
                  onChange={(e) =>
                    setSaleForm((p) => ({ ...p, contractNumber: e.target.value }))
                  }
                  placeholder="CCV-SENA-2026/001"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                Ao confirmar, a venda será criada com comissão de{" "}
                <strong>
                  6% (
                  {formatCurrency(
                    (proposalToClose.counterProposalPrice || proposalToClose.proposedPrice) * 0.06
                  )}
                  )
                </strong>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setProposalToClose(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isModalLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black disabled:opacity-50"
                >
                  {isModalLoading ? "..." : "Confirmar Venda"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Counter Proposal */}
      {proposalForCounter && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Enviar Contraproposta</h3>
              <button
                onClick={() => setProposalForCounter(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-2 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleConfirmCounter} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Novo Valor (R$) *
                </label>
                <input
                  type="number"
                  required
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Observações *
                </label>
                <textarea
                  rows={3}
                  required
                  value={counterNotes}
                  onChange={(e) => setCounterNotes(e.target.value)}
                  placeholder="Justificativa do proprietário..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setProposalForCounter(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isModalLoading}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold disabled:opacity-50"
                >
                  {isModalLoading ? "..." : "Enviar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
