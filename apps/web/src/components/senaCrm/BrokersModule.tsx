import React, { useState } from "react";
import {
  Users,
  Award,
  Plus,
  Phone,
  Mail,
  Target,
  TrendingUp,
  Building,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  UserCheck,
  Trophy,
} from "lucide-react";
import { Broker } from "../../types/senaCrm";

interface BrokersModuleProps {
  brokers: Broker[];
  onAddBroker: (broker: Partial<Broker>) => void;
}

export const BrokersModule: React.FC<BrokersModuleProps> = ({ brokers, onAddBroker }) => {
  const [isNewBrokerModalOpen, setIsNewBrokerModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [creci, setCreci] = useState("");
  const [team, setTeam] = useState("Equipe Alpha — Alto Padrão");
  const [managerName, setManagerName] = useState("Carlos Eduardo Sena");

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCreateBroker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !creci) return;

    onAddBroker({
      name,
      email,
      phone,
      creci,
      team,
      managerName,
      status: "Ativo",
      leadsCount: 0,
      salesCount: 0,
      rentalsCount: 0,
      vgvTotal: 0,
      commissionEarned: 0,
      conversionRate: 0,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80`,
    });

    setIsNewBrokerModalOpen(false);
    setName("");
    setEmail("");
    setPhone("");
    setCreci("");
  };

  const totalVgvTeam = brokers.reduce((acc, b) => acc + b.vgvTotal, 0);
  const totalCommissionsTeam = brokers.reduce((acc, b) => acc + b.commissionEarned, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <Users className="w-4 h-4" />
            <span>GESTÃO DE EQUIPE & CORRETORES DE ELITE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Corretores & Performance</h2>
          <p className="text-xs text-slate-400 mt-1">
            Equipes Alpha e Terra: acompanhamento de metas, ranking de VGV e captações.
          </p>
        </div>

        <button
          onClick={() => setIsNewBrokerModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Cadastrar Corretor
        </button>
      </div>

      {/* KPI Overview Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-xs font-medium text-slate-400">Total Corretores Ativos</span>
          <p className="text-2xl font-black text-white">
            {brokers.filter((b) => b.status === "Ativo").length}
          </p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-xs font-medium text-slate-400">VGV Acumulado da Equipe</span>
          <p className="text-2xl font-black text-amber-400">{formatCurrency(totalVgvTeam)}</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-xs font-medium text-slate-400">
            Comissões Geradas aos Corretores
          </span>
          <p className="text-2xl font-black text-emerald-400">
            {formatCurrency(totalCommissionsTeam)}
          </p>
        </div>
      </div>

      {/* Brokers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brokers.map((broker) => {
          return (
            <div
              key={broker.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 hover:border-slate-700 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header Profile */}
                <div className="flex items-start gap-3">
                  <img
                    src={broker.avatar}
                    alt={broker.name}
                    className="w-12 h-12 rounded-xl object-cover border border-amber-500/30"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-white truncate">{broker.name}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          broker.status === "Ativo"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {broker.status}
                      </span>
                    </div>
                    <p className="text-xs text-amber-400 font-semibold">{broker.team}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{broker.creci}</p>
                  </div>
                </div>

                {/* Contact info */}
                <div className="space-y-1 text-xs text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{broker.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{broker.email}</span>
                  </div>
                </div>

                {/* Performance Info */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-semibold">VGV Realizado:</span>
                    <span className="font-bold text-amber-400">
                      {formatCurrency(broker.vgvTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-semibold">Comissão Recebida:</span>
                    <span className="font-bold text-emerald-400">
                      {formatCurrency(broker.commissionEarned)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-semibold">Taxa de Conversão:</span>
                    <span className="font-bold text-white">{broker.conversionRate}%</span>
                  </div>
                </div>

                {/* Stats Counters */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-850 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Leads</span>
                    <strong className="text-white">{broker.leadsCount}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-850 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Vendas</span>
                    <strong className="text-emerald-400">{broker.salesCount}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-850 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Locações</span>
                    <strong className="text-teal-400">{broker.rentalsCount}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Gerência: {broker.managerName}</span>
                <span className="text-amber-400 font-semibold">Ativo na Matriz</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Broker Modal */}
      {isNewBrokerModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-white">Cadastrar Novo Corretor</h3>
            <form onSubmit={handleCreateBroker} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Nome Completo:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Gabriel Fonseca"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">CRECI:</label>
                  <input
                    type="text"
                    required
                    value={creci}
                    onChange={(e) => setCreci(e.target.value)}
                    placeholder="CRECI-SP 000.000-F"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Telefone / WhatsApp:
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  E-mail Corporativo:
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="gabriel@senaimoveis.com.br"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Equipe:</label>
                  <select
                    value={team}
                    onChange={(e) => setTeam(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Equipe Alpha — Alto Padrão">Equipe Alpha — Alto Padrão</option>
                    <option value="Equipe Terra — Loteamentos & Investimentos">
                      Equipe Terra — Loteamentos
                    </option>
                    <option value="Equipe Locações Prime">Equipe Locações Prime</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Gerente Responsável:
                  </label>
                  <input
                    type="text"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewBrokerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md"
                >
                  Salvar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
