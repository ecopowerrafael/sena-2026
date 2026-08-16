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
} from "lucide-react";
import { Proposal, SaleClosure, Property, Broker, Lead } from "../../types/senaCrm";

interface ProposalsSalesModuleProps {
  proposals: Proposal[];
  sales: SaleClosure[];
  properties: Property[];
  brokers: Broker[];
  leads: Lead[];
  onAddProposal: (proposal: Partial<Proposal>) => void;
  onApproveProposal: (proposalId: string, finalSaleDetails: Partial<SaleClosure>) => void;
  onSendCounterProposal: (proposalId: string, counterPrice: number, notes: string) => void;
}

export const ProposalsSalesModule: React.FC<ProposalsSalesModuleProps> = ({
  proposals,
  sales,
  properties,
  brokers,
  leads,
  onAddProposal,
  onApproveProposal,
  onSendCounterProposal,
}) => {
  const [activeTab, setActiveTab] = useState<"proposals" | "sales">("proposals");
  const [isNewProposalModalOpen, setIsNewProposalModalOpen] = useState(false);
  const [proposalToClose, setProposalToClose] = useState<Proposal | null>(null);
  const [proposalForCounter, setProposalForCounter] = useState<Proposal | null>(null);

  // New Proposal Form
  const [clientName, setClientName] = useState(leads[0]?.name || "");
  const [clientDoc, setClientDoc] = useState(leads[0]?.document || "");
  const [propertyCode, setPropertyCode] = useState(properties[0]?.code || "");
  const [brokerName, setBrokerName] = useState(brokers[0]?.name || "");
  const [proposedPrice, setProposedPrice] = useState(4500000);
  const [downPayment, setDownPayment] = useState(1000000);
  const [paymentDesc, setPaymentDesc] = useState(
    "Entrada de recursos próprios + Financiamento Bancário."
  );

  // Counter proposal form
  const [counterPrice, setCounterPrice] = useState(4700000);
  const [counterNotes, setCounterNotes] = useState("");

  // Sale closure modal form
  const [salePaymentType, setSalePaymentType] = useState<any>("Financiamento Bancário");
  const [saleBank, setSaleBank] = useState("Itaú Private");
  const [contractNumber, setContractNumber] = useState(`CCV-SENA-2026/0${sales.length + 80}`);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    const prop = properties.find((p) => p.code === propertyCode);
    const newCode = `PROP-2026-0${proposals.length + 45}`;

    onAddProposal({
      code: newCode,
      clientName,
      clientDocument: clientDoc || "000.000.000-00",
      propertyCode,
      propertyTitle: prop?.title || "Imóvel Selecionado",
      brokerName,
      advertisedPrice: prop?.salePrice || 5000000,
      proposedPrice: Number(proposedPrice),
      downPayment: Number(downPayment),
      installmentsCount: 1,
      installmentsValue: Number(proposedPrice) - Number(downPayment),
      paymentMethodDescription: paymentDesc,
      status: "Em Análise",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      history: [
        {
          date: `${new Date().toISOString().split("T")[0]} 10:00`,
          author: brokerName,
          action: `Proposta inicial formalizada no valor de ${formatCurrency(Number(proposedPrice))}.`,
        },
      ],
    });

    setIsNewProposalModalOpen(false);
  };

  const handleConfirmSaleClosure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalToClose) return;

    const prop = properties.find((p) => p.code === proposalToClose.propertyCode);
    const finalPrice = proposalToClose.counterProposalPrice || proposalToClose.proposedPrice;
    const commission = finalPrice * 0.06; // 6% comissão

    onApproveProposal(proposalToClose.id, {
      code: `VENDA-2026-0${sales.length + 19}`,
      clientName: proposalToClose.clientName,
      ownerName: prop?.ownerName || "Proprietário",
      propertyCode: proposalToClose.propertyCode,
      propertyTitle: proposalToClose.propertyTitle,
      brokerName: proposalToClose.brokerName,
      captatorName: prop?.brokerCaptatorName || "Rodrigo Mendonça",
      finalSalePrice: finalPrice,
      saleDate: new Date().toISOString().split("T")[0],
      paymentType: salePaymentType,
      bankFinancing:
        salePaymentType === "Financiamento Bancário"
          ? {
              bank: saleBank,
              approvedAmount: finalPrice - proposalToClose.downPayment,
              status: "Aprovado",
            }
          : undefined,
      documentationStatus: "Contrato Assinado",
      contractNumber,
      commissionTotal: commission,
    });

    setProposalToClose(null);
  };

  const handleConfirmCounter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalForCounter) return;

    onSendCounterProposal(
      proposalForCounter.id,
      Number(counterPrice),
      counterNotes || "Contraproposta formal enviada ao proponente."
    );
    setProposalForCounter(null);
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
        /* Proposals List with Negotiation History */
        <div className="space-y-4">
          {proposals.map((propDeal) => {
            const difference = propDeal.proposedPrice - propDeal.advertisedPrice;
            const diffPercent = ((difference / propDeal.advertisedPrice) * 100).toFixed(1);

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
                    <h3 className="font-bold text-sm text-white">{propDeal.clientName}</h3>
                    <span className="text-xs text-slate-400">• CPF: {propDeal.clientDocument}</span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                      propDeal.status === "Aceita pelo Proprietário"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : propDeal.status === "Contraproposta Enviada"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    }`}
                  >
                    {propDeal.status}
                  </span>
                </div>

                {/* Property & Value Breakdown Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div className="md:col-span-2 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Imóvel Objeto da Negociação
                    </span>
                    <p className="font-bold text-white text-sm">
                      <span className="text-amber-400 font-extrabold">{propDeal.propertyCode}</span>{" "}
                      — {propDeal.propertyTitle}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Corretor Responsável: {propDeal.brokerName}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Valor Anunciado
                    </span>
                    <p className="text-slate-300 line-through font-semibold text-sm">
                      {formatCurrency(propDeal.advertisedPrice)}
                    </p>
                    <span className="text-[10px] text-slate-400 block">Tabela oficial</span>
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
                      {diffPercent}% do valor pedido
                    </span>
                  </div>
                </div>

                {/* Payment Breakdown & Condition */}
                <div className="p-3 bg-slate-850/60 rounded-xl border border-slate-800 text-xs">
                  <span className="font-bold text-slate-200 block mb-1">
                    Condição de Pagamento Apresentada:
                  </span>
                  <p className="text-slate-300">{propDeal.paymentMethodDescription}</p>
                  {propDeal.counterProposalPrice && (
                    <div className="mt-2 pt-2 border-t border-slate-750 text-amber-300">
                      <strong>Contraproposta do Proprietário:</strong>{" "}
                      {formatCurrency(propDeal.counterProposalPrice)} —{" "}
                      {propDeal.counterProposalNotes}
                    </div>
                  )}
                </div>

                {/* Negotiation Timeline History */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Histórico de Movimentações:
                  </span>
                  {propDeal.history.map((h, hIdx) => (
                    <div key={hIdx} className="flex items-center gap-2 text-[11px] text-slate-300">
                      <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="text-slate-400 font-mono text-[10px]">{h.date}</span>
                      <span className="font-semibold text-white">{h.author}:</span>
                      <span className="text-slate-300">{h.action}</span>
                    </div>
                  ))}
                </div>

                {/* Proposal Actions */}
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
                    onClick={() => setProposalToClose(propDeal)}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    Aprovar & Fechar Venda
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Sales Closure Completed List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sales.map((sale) => (
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
                  {sale.saleDate.split("-").reverse().join("/")}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-white">{sale.propertyTitle}</h4>
                <p className="text-xs text-amber-400 font-mono font-semibold">
                  {sale.propertyCode}
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Comprador:</span>
                  <strong className="text-white">{sale.clientName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Proprietário Vendedor:</span>
                  <strong className="text-slate-200">{sale.ownerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Forma de Pagamento:</span>
                  <strong className="text-emerald-400">{sale.paymentType}</strong>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-850">
                  <span className="text-slate-400">Contrato:</span>
                  <span className="font-mono text-slate-300 text-[11px]">
                    {sale.contractNumber}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Valor Final de Venda</span>
                  <span className="text-base font-black text-amber-400">
                    {formatCurrency(sale.finalSalePrice)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Comissão Gerada (6%)</span>
                  <span className="text-sm font-black text-emerald-400">
                    {formatCurrency(sale.commissionTotal)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Corretor: {sale.brokerName}</span>
                <span>Captador: {sale.captatorName}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: New Proposal */}
      {isNewProposalModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Cadastrar Nova Proposta Comercial</h3>
              <button
                onClick={() => setIsNewProposalModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProposal} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Cliente Proponente *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nome do cliente"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">CPF/CNPJ</label>
                <input
                  type="text"
                  value={clientDoc}
                  onChange={(e) => setClientDoc(e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Imóvel Pretendido *
                </label>
                <select
                  value={propertyCode}
                  onChange={(e) => setPropertyCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.code}>
                      {p.code} — {p.title} (Anunciado: {formatCurrency(p.salePrice)})
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
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Valor da Entrada (R$)
                  </label>
                  <input
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Forma de Pagamento / Condições Especiais
                </label>
                <textarea
                  rows={2}
                  value={paymentDesc}
                  onChange={(e) => setPaymentDesc(e.target.value)}
                  placeholder="Ex: Sinal de 20% na assinatura do CCV, saldo na escritura via financiamento..."
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
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Registrar Proposta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Fechamento de Venda Formal */}
      {proposalToClose && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
              <div>
                <h3 className="text-base font-bold text-white">Efetivar Fechamento de Venda</h3>
                <p className="text-xs text-slate-400">Transição do imóvel para status 'Vendido'</p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <p className="font-bold text-white">{proposalToClose.propertyTitle}</p>
              <p className="text-amber-400 font-bold">
                Valor Final:{" "}
                {formatCurrency(
                  proposalToClose.counterProposalPrice || proposalToClose.proposedPrice
                )}
              </p>
              <p className="text-slate-400">Comprador: {proposalToClose.clientName}</p>
            </div>

            <form onSubmit={handleConfirmSaleClosure} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Forma de Pagamento Definitiva
                </label>
                <select
                  value={salePaymentType}
                  onChange={(e) => setSalePaymentType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Financiamento Bancário">Financiamento Bancário</option>
                  <option value="À Vista TED/PIX">À Vista TED/PIX</option>
                  <option value="Parcelamento Direto">Parcelamento Direto com Proprietário</option>
                  <option value="Permuta + Saldo">Permuta de Imóvel + Saldo em Dinheiro</option>
                </select>
              </div>

              {salePaymentType === "Financiamento Bancário" && (
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Banco Concessor do Financiamento
                  </label>
                  <input
                    type="text"
                    value={saleBank}
                    onChange={(e) => setSaleBank(e.target.value)}
                    placeholder="Ex: Itaú Private / Caixa Econômica / Santander"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Número do Contrato / CCV
                </label>
                <input
                  type="text"
                  required
                  value={contractNumber}
                  onChange={(e) => setContractNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                Ao confirmar, o status do imóvel será automaticamente alterado para{" "}
                <strong>Vendido</strong> e a comissão de{" "}
                <strong>
                  6% (
                  {formatCurrency(
                    (proposalToClose.counterProposalPrice || proposalToClose.proposedPrice) * 0.06
                  )}
                  )
                </strong>{" "}
                será distribuída na aba de comissões.
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
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black"
                >
                  Confirmar Venda & Atualizar Imóvel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Contraproposta */}
      {proposalForCounter && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              Registrar Contraproposta do Proprietário
            </h3>

            <form onSubmit={handleConfirmCounter} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Novo Valor da Contraproposta (R$) *
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
                  Condições & Justificativa do Proprietário
                </label>
                <textarea
                  rows={3}
                  required
                  value={counterNotes}
                  onChange={(e) => setCounterNotes(e.target.value)}
                  placeholder="Ex: Proprietário aceita o valor se mantiver a mobília planejada e fechamento em até 30 dias..."
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
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Salvar Contraproposta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
