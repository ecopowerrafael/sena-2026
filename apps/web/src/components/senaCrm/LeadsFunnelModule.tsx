import React, { useState } from "react";
import {
  GitPullRequest,
  ListFilter,
  Plus,
  Search,
  Phone,
  MessageCircle,
  Calendar,
  DollarSign,
  User,
  ArrowRight,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Layers,
  ChevronRight,
  Filter,
  Tag,
  Building,
} from "lucide-react";
import { Lead, LeadStatus, LeadOrigin, ClientType, Broker, Property } from "../../types/senaCrm";

interface LeadOriginOption {
  id: string;
  name: string;
}

interface LeadCampaignOption {
  id: string;
  name: string;
}

interface LeadsFunnelModuleProps {
  leads: Lead[];
  brokers: Broker[];
  properties: Property[];
  origins?: LeadOriginOption[];
  campaigns?: LeadCampaignOption[];
  onAddLead: (newLead: Partial<Lead>) => Promise<void>;
  onUpdateLeadStatus: (leadId: string, newStatus: LeadStatus, lostReason?: string) => void;
  onSelectLead: (lead: Lead) => void;
}

const FUNNEL_COLUMNS: { id: LeadStatus; title: string; color: string }[] = [
  { id: "novo", title: "Novo Lead", color: "border-blue-500 text-blue-400 bg-blue-500/10" },
  { id: "contato", title: "Contato", color: "border-indigo-500 text-indigo-400 bg-indigo-500/10" },
  {
    id: "qualificado",
    title: "Qualificado",
    color: "border-purple-500 text-purple-400 bg-purple-500/10",
  },
  {
    id: "apresentado",
    title: "Imóvel Apresentado",
    color: "border-amber-500 text-amber-400 bg-amber-500/10",
  },
  { id: "visita", title: "Visita Agendada", color: "border-teal-500 text-teal-400 bg-teal-500/10" },
  {
    id: "proposta",
    title: "Proposta",
    color: "border-orange-500 text-orange-400 bg-orange-500/10",
  },
  { id: "negociacao", title: "Negociação", color: "border-rose-500 text-rose-400 bg-rose-500/10" },
  {
    id: "fechado",
    title: "Fechado",
    color: "border-emerald-500 text-emerald-400 bg-emerald-500/10",
  },
];

export const LeadsFunnelModule: React.FC<LeadsFunnelModuleProps> = ({
  leads,
  brokers,
  properties,
  origins = [],
  campaigns = [],
  onAddLead,
  onUpdateLeadStatus,
  onSelectLead,
}) => {
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [originFilter, setOriginFilter] = useState<string>("all");
  const [brokerFilter, setBrokerFilter] = useState<string>("all");

  // Lost modal state
  const [leadToLose, setLeadToLose] = useState<Lead | null>(null);
  const [lostReason, setLostReason] = useState("");
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);

  // Form state
  const [isCreatingLead, setIsCreatingLead] = useState(false);
  const [createLeadError, setCreateLeadError] = useState<string | null>(null);

  // New Lead Form State
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadDoc, setNewLeadDoc] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("");
  const [newLeadEmail, setNewLeadEmail] = useState("");
  const [newLeadType, setNewLeadType] = useState<ClientType>("comprador");
  const [newLeadBrokerId, setNewLeadBrokerId] = useState(brokers[0]?.id || "");
  const [newLeadOrigin, setNewLeadOrigin] = useState<LeadOrigin>("Instagram Ads");
  const [newLeadCampaign, setNewLeadCampaign] = useState("");
  const [newLeadBudget, setNewLeadBudget] = useState(1500000);
  const [newLeadNotes, setNewLeadNotes] = useState("");

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.interestedInPropertyTitle &&
        lead.interestedInPropertyTitle.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesOrigin = originFilter === "all" || lead.origin === originFilter;
    const matchesBroker = brokerFilter === "all" || lead.brokerId === brokerFilter;

    return matchesSearch && matchesOrigin && matchesBroker;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName) return;

    setIsCreatingLead(true);
    setCreateLeadError(null);

    try {
      const selectedBroker = brokers.find((b) => b.id === newLeadBrokerId);

      await onAddLead({
        name: newLeadName,
        document: newLeadDoc || "000.000.000-00",
        phone: newLeadPhone || "(11) 90000-0000",
        whatsapp: newLeadPhone.replace(/\D/g, "") || "5511900000000",
        email: newLeadEmail || "cliente@email.com",
        type: newLeadType,
        brokerId: newLeadBrokerId,
        brokerName: selectedBroker?.name || "Corretor Geral",
        origin: newLeadOrigin,
        campaign: newLeadCampaign || "Orgânico / Direto",
        status: "novo",
        createdAt: new Date().toISOString().split("T")[0],
        lastContact: new Date().toISOString().split("T")[0],
        nextContact: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        estimatedBudget: Number(newLeadBudget),
        notes: newLeadNotes || "Lead cadastrado manualmente no CRM.",
      });

      setIsNewLeadModalOpen(false);
      // Reset form
      setNewLeadName("");
      setNewLeadDoc("");
      setNewLeadPhone("");
      setNewLeadEmail("");
      setNewLeadNotes("");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Erro ao criar lead";
      setCreateLeadError(errorMsg);
    } finally {
      setIsCreatingLead(false);
    }
  };

  const handleConfirmLost = () => {
    if (leadToLose && lostReason) {
      onUpdateLeadStatus(leadToLose.id, "perdido", lostReason);
      setLeadToLose(null);
      setLostReason("");
    }
  };

  const moveNext = (lead: Lead) => {
    const currentIndex = FUNNEL_COLUMNS.findIndex((col) => col.id === lead.status);
    if (currentIndex !== -1 && currentIndex < FUNNEL_COLUMNS.length - 1) {
      const nextStage = FUNNEL_COLUMNS[currentIndex + 1].id;
      onUpdateLeadStatus(lead.id, nextStage);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Filter & Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search input */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrar por nome, tel, imóvel..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Origin filter */}
          <select
            value={originFilter}
            onChange={(e) => setOriginFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Todas as Origens</option>
            {origins.map((o) => (
              <option key={o.id} value={o.name}>
                {o.name}
              </option>
            ))}
          </select>

          {/* Broker filter */}
          <select
            value={brokerFilter}
            onChange={(e) => setBrokerFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Todos os Corretores</option>
            {brokers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 self-end lg:self-auto">
          {/* Toggle Kanban vs Table */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === "kanban"
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <GitPullRequest className="w-3.5 h-3.5" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === "table"
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              Tabela
            </button>
          </div>

          <button
            onClick={() => setIsNewLeadModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Novo Lead
          </button>
        </div>
      </div>

      {/* View Mode: Kanban */}
      {viewMode === "kanban" ? (
        <div className="overflow-x-auto pb-4 custom-scrollbar">
          <div className="flex items-start gap-3.5 min-w-[1400px]">
            {FUNNEL_COLUMNS.map((column) => {
              const columnLeads = filteredLeads.filter((l) => l.status === column.id);
              const columnTotalBudget = columnLeads.reduce((acc, l) => acc + l.estimatedBudget, 0);

              return (
                <div
                  key={column.id}
                  className="w-80 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shrink-0 max-h-[78vh] shadow-xs"
                >
                  {/* Column Header */}
                  <div className="p-3.5 border-b border-slate-800/80 bg-slate-950/40 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${column.color.split(" ")[0]} border-2`}
                        />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          {column.title}
                        </h4>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {columnLeads.length}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">
                      Total:{" "}
                      <strong className="text-amber-300">
                        {formatCurrency(columnTotalBudget)}
                      </strong>
                    </p>
                  </div>

                  {/* Cards Container */}
                  <div className="p-2.5 overflow-y-auto space-y-2.5 flex-1 custom-scrollbar">
                    {columnLeads.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                        Nenhum lead nesta etapa
                      </div>
                    ) : (
                      columnLeads.map((lead) => (
                        <div
                          key={lead.id}
                          className="bg-slate-850/90 border border-slate-700/80 hover:border-amber-500/50 rounded-xl p-3 shadow-xs hover:shadow-md transition-all group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-amber-500/20 capitalize">
                              {lead.type}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {lead.origin}
                            </span>
                          </div>

                          <h5
                            onClick={() => onSelectLead(lead)}
                            className="text-xs font-bold text-white mt-1.5 hover:text-amber-300 cursor-pointer transition-colors line-clamp-1"
                          >
                            {lead.name}
                          </h5>

                          {lead.interestedInPropertyTitle && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-300 mt-1 truncate">
                              <Building className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{lead.interestedInPropertyTitle}</span>
                            </div>
                          )}

                          <div className="mt-2 pt-2 border-t border-slate-750 flex items-center justify-between text-[11px]">
                            <div>
                              <span className="text-[10px] text-slate-400 block">
                                Orçamento Est.
                              </span>
                              <span className="font-bold text-amber-300">
                                {formatCurrency(lead.estimatedBudget)}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block">Corretor</span>
                              <span className="text-slate-200 font-medium">
                                {lead.brokerName.split(" ")[0]}
                              </span>
                            </div>
                          </div>

                          {lead.campaign && (
                            <div className="mt-2 text-[10px] text-slate-400 bg-slate-900/80 px-2 py-1 rounded truncate border border-slate-800">
                              📢 {lead.campaign}
                            </div>
                          )}

                          {/* Quick Action Buttons on Card */}
                          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between gap-1">
                            <button
                              onClick={() => setLeadToLose(lead)}
                              className="text-[10px] text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                            >
                              <XCircle className="w-3 h-3" />
                              Perdido
                            </button>

                            <button
                              onClick={() => moveNext(lead)}
                              className="text-[10px] font-bold bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 px-2.5 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1 transition-all"
                            >
                              <span>Avançar</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Cliente / Tipo</th>
                  <th className="py-3 px-4">Contatos</th>
                  <th className="py-3 px-4">Origem & Campanha</th>
                  <th className="py-3 px-4">Imóvel / Orçamento</th>
                  <th className="py-3 px-4">Corretor</th>
                  <th className="py-3 px-4">Etapa do Funil</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{lead.name}</div>
                      <div className="text-[11px] text-slate-400 capitalize">
                        {lead.type} • CPF: {lead.document}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{lead.phone}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">{lead.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 text-[10px] font-semibold border border-amber-500/20">
                        {lead.origin}
                      </span>
                      {lead.campaign && (
                        <div className="text-[10px] text-slate-400 mt-1 truncate max-w-[180px]">
                          {lead.campaign}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-amber-300">
                        {formatCurrency(lead.estimatedBudget)}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                        {lead.interestedInPropertyTitle || "Buscando opções"}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{lead.brokerName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-white uppercase border border-slate-700">
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectLead(lead)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] border border-slate-700 transition-colors"
                      >
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Mark Lead as Lost (with required reason) */}
      {leadToLose && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Marcar Lead como Perdido</h3>
            </div>

            <p className="text-xs text-slate-300">
              Você está arquivando o lead <strong className="text-white">{leadToLose.name}</strong>.
              Conforme as regras do CRM SENA 2026, informe o motivo para alimentar os relatórios de
              perda:
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Motivo da Perda *</label>
              <select
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="">Selecione o motivo principal...</option>
                <option value="Preço acima do orçamento / Sem condição de pagamento">
                  Preço acima do orçamento / Sem condição de pagamento
                </option>
                <option value="Optou por imóvel concorrente em outra imobiliária">
                  Optou por imóvel concorrente em outra imobiliária
                </option>
                <option value="Crédito ou financiamento bancário reprovado">
                  Crédito ou financiamento bancário reprovado
                </option>
                <option value="Desistência temporária da compra/locação">
                  Desistência temporária da compra/locação
                </option>
                <option value="Localização ou metragem inadequada">
                  Localização ou metragem inadequada
                </option>
                <option value="Falta de retorno após múltiplas tentativas">
                  Falta de retorno após múltiplas tentativas
                </option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setLeadToLose(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmLost}
                disabled={!lostReason}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold transition-colors"
              >
                Confirmar Perda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Lead Creation Form */}
      {isNewLeadModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Cadastrar Novo Lead & Prospect</h3>
                <p className="text-xs text-slate-400">Inserção direta no funil comercial da SENA</p>
              </div>
              <button
                onClick={() => setIsNewLeadModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {createLeadError && (
              <div className="bg-rose-950/40 border border-rose-500/50 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-300">{createLeadError}</p>
              </div>
            )}

            <form onSubmit={handleCreateLead} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={newLeadName}
                    onChange={(e) => setNewLeadName(e.target.value)}
                    placeholder="Ex: Dra. Mariana Vasconcelos"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">CPF ou CNPJ</label>
                  <input
                    type="text"
                    value={newLeadDoc}
                    onChange={(e) => setNewLeadDoc(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Telefone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLeadPhone}
                    onChange={(e) => setNewLeadPhone(e.target.value)}
                    placeholder="(11) 98888-7777"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">E-mail</label>
                  <input
                    type="email"
                    value={newLeadEmail}
                    onChange={(e) => setNewLeadEmail(e.target.value)}
                    placeholder="cliente@exemplo.com.br"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Tipo de Cliente</label>
                  <select
                    value={newLeadType}
                    onChange={(e) => setNewLeadType(e.target.value as ClientType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none capitalize"
                  >
                    <option value="comprador">Comprador</option>
                    <option value="proprietario">Proprietário</option>
                    <option value="locador">Locador</option>
                    <option value="locatario">Locatário</option>
                    <option value="investidor">Investidor</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Corretor Responsável
                  </label>
                  <select
                    value={newLeadBrokerId}
                    onChange={(e) => setNewLeadBrokerId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    {brokers.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.team})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Origem do Lead</label>
                  <select
                    value={newLeadOrigin}
                    onChange={(e) => setNewLeadOrigin(e.target.value as LeadOrigin)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">Selecione uma origem...</option>
                    {origins.map((o) => (
                      <option key={o.id} value={o.name}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Campanha Específica
                  </label>
                  <select
                    value={newLeadCampaign}
                    onChange={(e) => setNewLeadCampaign(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">Nenhuma (será "Orgânico / Direto")</option>
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Orçamento Estimado (R$):{" "}
                  <strong className="text-amber-400">{formatCurrency(newLeadBudget)}</strong>
                </label>
                <input
                  type="range"
                  min="200000"
                  max="15000000"
                  step="100000"
                  value={newLeadBudget}
                  onChange={(e) => setNewLeadBudget(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Observações Iniciais
                </label>
                <textarea
                  rows={2}
                  value={newLeadNotes}
                  onChange={(e) => setNewLeadNotes(e.target.value)}
                  placeholder="Preferências, horários para contato, composição de renda..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewLeadModalOpen(false)}
                  disabled={isCreatingLead}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingLead || !newLeadOrigin}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20"
                >
                  {isCreatingLead ? "Criando..." : "Salvar e Iniciar Atendimento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
