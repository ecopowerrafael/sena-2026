import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Plus,
  MapPin,
  User,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Building,
  Phone,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Visit, Property, Broker, Lead } from "../../types/senaCrm";

interface VisitsModuleProps {
  visits: Visit[];
  properties: Property[];
  brokers: Broker[];
  leads: Lead[];
  onAddVisit: (visit: Partial<Visit>) => void;
  onUpdateVisitFeedback: (visitId: string, feedback: string, impression: any, status: any) => void;
}

export const VisitsModule: React.FC<VisitsModuleProps> = ({
  visits,
  properties,
  brokers,
  leads,
  onAddVisit,
  onUpdateVisitFeedback,
}) => {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedVisitForFeedback, setSelectedVisitForFeedback] = useState<Visit | null>(null);

  // New Visit Form State
  const [clientName, setClientName] = useState(leads[0]?.name || "");
  const [clientPhone, setClientPhone] = useState(leads[0]?.phone || "");
  const [propertyCode, setPropertyCode] = useState(properties[0]?.code || "");
  const [brokerName, setBrokerName] = useState(brokers[0]?.name || "");
  const [visitDate, setVisitDate] = useState("2026-08-16");
  const [visitTime, setVisitTime] = useState("10:00");

  // Feedback Form State
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackImpression, setFeedbackImpression] = useState<any>("Adorou / Fará Proposta");
  const [feedbackStatus, setFeedbackStatus] = useState<any>("Realizada");

  const todayStr = "2026-08-16";
  const todayVisits = visits.filter((v) => v.date === todayStr);
  const upcomingVisits = visits.filter((v) => v.date > todayStr);
  const pastVisits = visits.filter((v) => v.date < todayStr || v.status === "Realizada");

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prop = properties.find((p) => p.code === propertyCode);

    onAddVisit({
      clientName,
      clientPhone,
      propertyCode,
      propertyTitle: prop?.title || "Imóvel Selecionado",
      propertyAddress: prop?.address || "Endereço Cadastrado",
      brokerName,
      date: visitDate,
      time: visitTime,
      status: "Agendada",
      feedback: "",
    });

    setIsScheduleModalOpen(false);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedVisitForFeedback) {
      onUpdateVisitFeedback(
        selectedVisitForFeedback.id,
        feedbackText,
        feedbackImpression,
        feedbackStatus
      );
      setSelectedVisitForFeedback(null);
      setFeedbackText("");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <Calendar className="w-4 h-4" />
            Controle de Visitas Imobiliárias
          </div>
          <h2 className="text-lg font-bold text-white">Agenda & Laudos de Visitação</h2>
          <p className="text-xs text-slate-400">
            Acompanhamento de visitas, confirmações e impressões do cliente
          </p>
        </div>

        <button
          onClick={() => setIsScheduleModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Agendar Nova Visita
        </button>
      </div>

      {/* Grid of Sections: Today's Visits & Upcoming Visits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Visits */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <h3 className="text-sm font-bold text-white">Visitas do Dia (Hoje)</h3>
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              {todayVisits.length} agendadas
            </span>
          </div>

          <div className="space-y-3">
            {todayVisits.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">
                Nenhuma visita agendada para hoje.
              </p>
            ) : (
              todayVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="bg-slate-850 border border-slate-700/80 rounded-xl p-4 space-y-2 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs font-black">
                        {visit.time}
                      </span>
                      <span className="font-bold text-xs text-white">{visit.clientName}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-blue-300 border border-slate-700">
                      {visit.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300">
                    <strong className="text-amber-400 font-bold">{visit.propertyCode}</strong> •{" "}
                    {visit.propertyTitle}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>{visit.propertyAddress}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-750 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">
                      Corretor: <strong className="text-slate-200">{visit.brokerName}</strong>
                    </span>
                    <button
                      onClick={() => setSelectedVisitForFeedback(visit)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold text-[11px] transition-colors"
                    >
                      Registrar Feedback
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming & Future Visits */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Próximas Visitas</h3>
            </div>
            <span className="text-xs text-slate-400">Próximos 7 dias</span>
          </div>

          <div className="space-y-3">
            {upcomingVisits.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">
                Nenhuma próxima visita agendada.
              </p>
            ) : (
              upcomingVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="bg-slate-850/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-bold text-[11px]">
                        {visit.date.split("-").reverse().join("/")} às {visit.time}
                      </span>
                      <span className="font-bold text-white">{visit.clientName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {visit.brokerName.split(" ")[0]}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 truncate">
                    <span className="text-amber-400 font-bold">{visit.propertyCode}</span> —{" "}
                    {visit.propertyTitle}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* History & Registered Feedbacks */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              Histórico de Visitas & Feedbacks dos Clientes
            </h3>
          </div>
          <span className="text-xs text-slate-400">Qualificação pós-visita</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pastVisits.map((visit) => (
            <div
              key={visit.id}
              className="p-4 rounded-xl bg-slate-850/80 border border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">{visit.clientName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                  {visit.status}
                </span>
              </div>

              <div className="text-xs text-slate-300">
                <span className="text-amber-400 font-bold">{visit.propertyCode}</span> •{" "}
                {visit.propertyTitle}
              </div>

              {visit.clientImpression && (
                <div className="text-[11px] text-amber-300 bg-slate-900/90 p-2 rounded-lg border border-slate-800 font-medium">
                  <strong>Impressão:</strong> {visit.clientImpression}
                </div>
              )}

              {visit.feedback && (
                <div className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800 italic">
                  "{visit.feedback}"
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span>Data: {visit.date.split("-").reverse().join("/")}</span>
                <span>Atendido por: {visit.brokerName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Agendar Visita */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Agendar Nova Visita Imobiliária</h3>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Cliente Interessado *
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
                <label className="font-semibold text-slate-300 block mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Imóvel a Visitar *
                </label>
                <select
                  value={propertyCode}
                  onChange={(e) => setPropertyCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.code}>
                      {p.code} — {p.title} ({p.neighborhood})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Corretor Acompanhante *
                </label>
                <select
                  value={brokerName}
                  onChange={(e) => setBrokerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {brokers.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name} ({b.creci})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Horário *</label>
                  <input
                    type="time"
                    required
                    value={visitTime}
                    onChange={(e) => setVisitTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Registrar Feedback */}
      {selectedVisitForFeedback && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Registrar Feedback da Visita</h3>
              <button
                onClick={() => setSelectedVisitForFeedback(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <p className="font-bold text-white">{selectedVisitForFeedback.clientName}</p>
                <p className="text-slate-400 text-[11px]">
                  {selectedVisitForFeedback.propertyCode} - {selectedVisitForFeedback.propertyTitle}
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Status da Visita</label>
                <select
                  value={feedbackStatus}
                  onChange={(e) => setFeedbackStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Realizada">Realizada com Sucesso</option>
                  <option value="Cliente Não Compareceu">Cliente Não Compareceu (No-show)</option>
                  <option value="Cancelada">Cancelada Antecipadamente</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Impressão Geral do Cliente
                </label>
                <select
                  value={feedbackImpression}
                  onChange={(e) => setFeedbackImpression(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Adorou / Fará Proposta">Adorou / Fará Proposta Formal</option>
                  <option value="Gostou mas achou caro">
                    Gostou mas achou o valor acima do mercado
                  </option>
                  <option value="Imóvel pequeno">
                    Achou a metragem ou quantidade de quartos insuficiente
                  </option>
                  <option value="Localização desfavorável">Localização ou rua não agradou</option>
                  <option value="Sem interesse">Sem interesse no imóvel</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Comentários & Próximos Passos
                </label>
                <textarea
                  rows={3}
                  required
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Relate os pontos elogiados, objeções levantadas pelo cliente e previsão de proposta..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedVisitForFeedback(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Salvar Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
