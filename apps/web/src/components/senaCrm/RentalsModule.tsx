import React, { useState } from "react";
import {
  KeyRound,
  FileText,
  DollarSign,
  ArrowRightLeft,
  ClipboardCheck,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  ArrowRight,
  ShieldCheck,
  Download,
  Send,
  Building,
  User,
  Calendar,
} from "lucide-react";
import { RentalContract, RentalPayout, Inspection, MaintenanceRequest } from "../../types/senaCrm";

interface RentalsModuleProps {
  rentalContracts: RentalContract[];
  rentalPayouts: RentalPayout[];
  inspections: Inspection[];
  maintenances: MaintenanceRequest[];
  initialSubTab?: "contratos" | "repasses" | "vistorias" | "manutencoes";
}

export const RentalsModule: React.FC<RentalsModuleProps> = ({
  rentalContracts,
  rentalPayouts,
  inspections,
  maintenances,
  initialSubTab = "contratos",
}) => {
  const [subTab, setSubTab] = useState<
    "funil" | "contratos" | "repasses" | "vistorias" | "manutencoes"
  >(
    initialSubTab === "repasses"
      ? "repasses"
      : initialSubTab === "vistorias"
        ? "vistorias"
        : initialSubTab === "manutencoes"
          ? "manutencoes"
          : "contratos"
  );

  const [selectedPayout, setSelectedPayout] = useState<RentalPayout | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "Pago":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "A Vencer":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "Vencido":
      case "Em Atraso":
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  const totalMonthlyRentAdministered = rentalContracts.reduce(
    (acc, c) => acc + c.monthlyRentalValue,
    0
  );
  const totalAdminFeesMonthly = rentalContracts.reduce(
    (acc, c) => acc + (c.monthlyRentalValue * c.adminFeePercentage) / 100,
    0
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Sub-Tabs Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <KeyRound className="w-4 h-4" />
            Módulo de Gestão de Locações & Administração Predial
          </div>
          <h2 className="text-lg font-bold text-white">Administração de Contratos & Repasses</h2>
          <p className="text-xs text-slate-400">
            Carteira ativa:{" "}
            <strong className="text-amber-300">
              {formatCurrency(totalMonthlyRentAdministered)}/mês
            </strong>{" "}
            sob gestão • Taxa adm:{" "}
            <strong className="text-emerald-400">
              {formatCurrency(totalAdminFeesMonthly)}/mês
            </strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setSubTab("contratos")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subTab === "contratos"
                ? "bg-amber-500 text-slate-950 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Contratos ({rentalContracts.length})
          </button>
          <button
            onClick={() => setSubTab("repasses")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subTab === "repasses"
                ? "bg-amber-500 text-slate-950 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Recebimentos & Repasses
          </button>
          <button
            onClick={() => setSubTab("vistorias")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subTab === "vistorias"
                ? "bg-amber-500 text-slate-950 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Vistorias ({inspections.length})
          </button>
          <button
            onClick={() => setSubTab("manutencoes")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subTab === "manutencoes"
                ? "bg-amber-500 text-slate-950 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Manutenções ({maintenances.length})
          </button>
          <button
            onClick={() => setSubTab("funil")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subTab === "funil"
                ? "bg-amber-500 text-slate-950 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Funil de Locação
          </button>
        </div>
      </div>

      {/* SUB-TAB: CONTRATOS */}
      {subTab === "contratos" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">
                Carteira de Contratos de Locação Administrados
              </h3>
              <p className="text-xs text-slate-400">
                Controle de vencimentos, taxas administrativas e garantias
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rentalContracts.map((contract) => (
              <div
                key={contract.id}
                className="bg-slate-850/80 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {contract.contractNumber}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getPaymentBadge(contract.paymentStatus)}`}
                  >
                    {contract.paymentStatus}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-white">{contract.propertyTitle}</h4>
                  <p className="text-[11px] text-slate-400">{contract.propertyAddress}</p>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Locatário:</span>
                    <strong className="text-white">{contract.tenantName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Proprietário:</span>
                    <strong className="text-slate-200">{contract.ownerName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Garantia Locatícia:</span>
                    <strong className="text-emerald-400">{contract.guaranteeType}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Índice de Reajuste:</span>
                    <span className="text-slate-300 font-semibold">
                      {contract.readjustmentIndex} (Próx: {contract.nextReadjustmentDate})
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">
                      Aluguel Bruto (Venc. dia {contract.dueDay})
                    </span>
                    <span className="text-sm font-black text-amber-400">
                      {formatCurrency(contract.monthlyRentalValue)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">
                      Taxa Adm ({contract.adminFeePercentage}%)
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      {formatCurrency(
                        (contract.monthlyRentalValue * contract.adminFeePercentage) / 100
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: RECEBIMENTOS & REPASSES */}
      {subTab === "repasses" && (
        <div className="space-y-6">
          {/* Formula Calculation Demonstrator Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-800 rounded-2xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
              Fórmula de Cálculo Automático do Repasse Líquido
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-white bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-amber-400">Aluguel Recebido</span>
              <span className="text-slate-500 font-black">−</span>
              <span className="text-rose-400">Taxa de Administração (8-10%)</span>
              <span className="text-slate-500 font-black">−</span>
              <span className="text-orange-400">Despesas Autorizadas (Reparos/IPTU)</span>
              <span className="text-slate-500 font-black">=</span>
              <span className="text-emerald-400 font-black text-sm">
                Repasse Líquido ao Proprietário
              </span>
            </div>
          </div>

          {/* Payouts Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Extrato de Recebimentos & Repasses (Competência 08/2026)
                </h3>
                <p className="text-xs text-slate-400">
                  Demonstrativo financeiro discriminado por imóvel
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-3">Contrato / Imóvel</th>
                    <th className="py-3 px-3">Proprietário</th>
                    <th className="py-3 px-3">Aluguel Recebido</th>
                    <th className="py-3 px-3">Taxa Adm.</th>
                    <th className="py-3 px-3">Despesas</th>
                    <th className="py-3 px-3">Repasse Líquido</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Comprovante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {rentalPayouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-mono text-amber-400 font-bold">
                          {payout.contractNumber}
                        </span>
                        <span className="block text-slate-300 font-semibold truncate max-w-[200px]">
                          {payout.propertyTitle}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-white">{payout.ownerName}</td>
                      <td className="py-3 px-3 font-bold text-white">
                        {formatCurrency(payout.grossRentReceived)}
                      </td>
                      <td className="py-3 px-3 text-rose-400 font-medium">
                        − {formatCurrency(payout.adminFeeDeduction)}
                      </td>
                      <td className="py-3 px-3 text-orange-400 font-medium">
                        {payout.authorizedExpensesDeduction > 0
                          ? `− ${formatCurrency(payout.authorizedExpensesDeduction)}`
                          : "R$ 0"}
                      </td>
                      <td className="py-3 px-3 font-black text-emerald-400 text-sm">
                        {formatCurrency(payout.netOwnerPayout)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            payout.status === "Repassado ao Proprietário"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : payout.status === "Aguardando Recebimento"
                                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          }`}
                        >
                          {payout.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedPayout(payout)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] border border-slate-700"
                        >
                          Ver Demonstrativo
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: VISTORIAS */}
      {subTab === "vistorias" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Vistorias Técnicas Imobiliárias</h3>
              <p className="text-xs text-slate-400">
                Laudos fotográficos de Entrada, Periódica e Saída
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inspections.map((insp) => (
              <div
                key={insp.id}
                className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-400">{insp.code}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                    {insp.type}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white">{insp.propertyTitle}</h4>
                  <p className="text-[11px] text-slate-400">
                    Vistoriador: {insp.inspectorName} • Data:{" "}
                    {insp.date.split("-").reverse().join("/")}
                  </p>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 italic">
                  "{insp.generalObservations}"
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                  <span className="text-slate-400">📸 {insp.photosCount} fotos anexadas</span>
                  <span className="font-semibold text-emerald-400">{insp.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: MANUTENÇÕES */}
      {subTab === "manutencoes" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Chamados de Manutenção & Reparos</h3>
              <p className="text-xs text-slate-400">
                Orçamentos com prestadores e autorizações do proprietário
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {maintenances.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">{m.propertyTitle}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      m.status === "Concluído"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {m.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300">{m.issueDescription}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-750 text-[11px]">
                  <span className="text-slate-400">
                    Prestador: <strong className="text-slate-200">{m.serviceProviderName}</strong>
                  </span>
                  <span className="text-slate-400">
                    Orçamento:{" "}
                    <strong className="text-amber-400">{formatCurrency(m.budgetAmount)}</strong>
                  </span>
                  <span className="text-slate-400">
                    Aprovação do Proprietário:{" "}
                    <strong className={m.approvedByOwner ? "text-emerald-400" : "text-amber-400"}>
                      {m.approvedByOwner ? "Autorizado" : "Pendente"}
                    </strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: FUNIL DE LOCAÇÃO */}
      {subTab === "funil" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-white">Fluxo de Funil de Locação SENA Prime</h3>
            <p className="text-xs text-slate-400">
              Passo a passo padrão para locação segura e sem burocracia
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 pt-2">
            {[
              {
                step: "01",
                title: "Lead Inicial",
                desc: "Captação & Perfil de Interesse",
                color: "border-blue-500",
              },
              {
                step: "02",
                title: "Visita Agendada",
                desc: "Apresentação com Corretor",
                color: "border-indigo-500",
              },
              {
                step: "03",
                title: "Análise Cadastral",
                desc: "Score & Renda (CredPago/Porto)",
                color: "border-purple-500",
              },
              {
                step: "04",
                title: "Aprovação & Garantia",
                desc: "Emissão de Apólice Fiança",
                color: "border-amber-500",
              },
              {
                step: "05",
                title: "Contrato Digital",
                desc: "Minuta & Assinatura Eletrônica",
                color: "border-teal-500",
              },
              {
                step: "06",
                title: "Vistoria Inicial",
                desc: "Laudo com +80 fotos periciais",
                color: "border-emerald-500",
              },
              {
                step: "07",
                title: "Entrega das Chaves",
                desc: "Posse do imóvel & Início da locação",
                color: "border-yellow-500",
              },
            ].map((st, sIdx) => (
              <div
                key={sIdx}
                className={`p-3 rounded-xl bg-slate-850 border-t-2 ${st.color} border-slate-800 space-y-1 text-xs`}
              >
                <span className="text-[10px] font-black text-amber-400 font-mono">
                  ETAPA {st.step}
                </span>
                <h4 className="font-bold text-white">{st.title}</h4>
                <p className="text-[10px] text-slate-400">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Demonstrativo do Repasse */}
      {selectedPayout && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                Demonstrativo de Repasse ao Proprietário
              </h3>
              <button
                onClick={() => setSelectedPayout(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <p className="font-bold text-white">{selectedPayout.propertyTitle}</p>
                <p className="text-slate-400">
                  Proprietário Beneficiário:{" "}
                  <strong className="text-slate-200">{selectedPayout.ownerName}</strong>
                </p>
                <p className="text-slate-400">
                  Competência: <strong>{selectedPayout.competenceMonth}</strong>
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-slate-300">
                  <span>Aluguel Bruto Recebido:</span>
                  <span className="font-bold text-white">
                    {formatCurrency(selectedPayout.grossRentReceived)}
                  </span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>Taxa de Administração Imobiliária:</span>
                  <span>− {formatCurrency(selectedPayout.adminFeeDeduction)}</span>
                </div>
                <div className="flex justify-between text-orange-400">
                  <span>Despesas / Consertos Autorizados:</span>
                  <span>− {formatCurrency(selectedPayout.authorizedExpensesDeduction)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-black text-emerald-400">
                  <span>VALOR LÍQUIDO REPASSADO:</span>
                  <span>{formatCurrency(selectedPayout.netOwnerPayout)}</span>
                </div>
              </div>

              {selectedPayout.receiptNumber && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-300">
                  Comprovante Bancário PIX: <strong>{selectedPayout.receiptNumber}</strong>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedPayout(null)}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Fechar Demonstrativo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
