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
  X,
} from "lucide-react";
import type { ClientDto } from "@sena/shared";
import type { Property } from "../../types/senaCrm";
import { useVisits, type Visit } from "../../hooks/useVisits";
import { useClients } from "../../hooks/useClients";
import { useProperties } from "../../hooks/useProperties";

interface VisitsModuleProps {
  properties: Property[];
}

export const VisitsModule: React.FC<VisitsModuleProps> = ({ properties }) => {
  const { visits, createVisit, updateVisit, isLoading } = useVisits();
  const { clients } = useClients();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedVisitForFeedback, setSelectedVisitForFeedback] = useState<Visit | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Schedule form state
  const [scheduleForm, setScheduleForm] = useState({
    clientId: "",
    propertyId: "",
    scheduledAt: new Date().toISOString().split("T")[0],
    time: "10:00",
    durationMinutes: 60,
  });

  // Feedback form state
  const [feedbackForm, setFeedbackForm] = useState({
    feedback: "",
    impression: "",
    status: "COMPLETED" as "COMPLETED" | "CANCELLED" | "NO_SHOW",
  });

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.clientId || !scheduleForm.propertyId) return;

    try {
      setIsModalLoading(true);
      const [date, time] = [scheduleForm.scheduledAt, scheduleForm.time];
      const scheduledAt = new Date(`${date}T${time}:00`).toISOString();

      await createVisit({
        clientId: scheduleForm.clientId,
        propertyId: scheduleForm.propertyId,
        scheduledAt,
        durationMinutes: scheduleForm.durationMinutes,
      });

      setIsScheduleModalOpen(false);
      setScheduleForm({
        clientId: "",
        propertyId: "",
        scheduledAt: new Date().toISOString().split("T")[0],
        time: "10:00",
        durationMinutes: 60,
      });
    } catch (err) {
      console.error("Failed to create visit:", err);
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisitForFeedback) return;

    try {
      setIsModalLoading(true);
      await updateVisit(selectedVisitForFeedback.id, {
        feedback: feedbackForm.feedback,
        impression: feedbackForm.impression,
        status: feedbackForm.status,
      });
      setSelectedVisitForFeedback(null);
      setFeedbackForm({ feedback: "", impression: "", status: "COMPLETED" });
    } catch (err) {
      console.error("Failed to update visit:", err);
    } finally {
      setIsModalLoading(false);
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("pt-BR");
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const getPropertyName = (propId: string) => {
    return properties.find((p) => p.id === propId)?.title || "---";
  };

  const getClientName = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.name || "---";
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <Calendar className="w-4 h-4" />
            Visitas Imobiliárias
          </div>
          <h2 className="text-lg font-bold text-white">Agenda & Laudos</h2>
          <p className="text-xs text-slate-400">Gerenciar agendamentos e feedback</p>
        </div>
        <button
          onClick={() => setIsScheduleModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          Agendar Visita
        </button>
      </div>

      {/* Visits List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs">
        <div className="text-xs font-bold text-white uppercase tracking-wider">
          Visitas ({visits.length})
        </div>

        {isLoading ? (
          <div className="text-xs text-slate-400 py-8 text-center">Carregando...</div>
        ) : visits.length === 0 ? (
          <div className="text-xs text-slate-400 py-8 text-center">Nenhuma visita agendada</div>
        ) : (
          <div className="space-y-2">
            {visits.map((visit) => (
              <div
                key={visit.id}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-3 h-3 text-amber-400" />
                    <span className="text-xs font-bold text-white">
                      {getClientName(visit.clientId)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Building className="w-3 h-3" />
                    {getPropertyName(visit.propertyId)}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(visit.scheduledAt)}
                    <Clock className="w-3 h-3 ml-2" />
                    {formatTime(visit.scheduledAt)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      visit.status === "COMPLETED"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : visit.status === "CANCELLED"
                          ? "bg-red-500/20 text-red-300"
                          : "bg-blue-500/20 text-blue-300"
                    }`}
                  >
                    {visit.status === "COMPLETED"
                      ? "Realizada"
                      : visit.status === "CANCELLED"
                        ? "Cancelada"
                        : "Agendada"}
                  </span>
                  <button
                    onClick={() => setSelectedVisitForFeedback(visit)}
                    className="px-2 py-1 rounded text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                  >
                    Feedback
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full mx-4 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Agendar Visita</h3>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                  Cliente
                </label>
                <select
                  value={scheduleForm.clientId}
                  onChange={(e) => setScheduleForm((p) => ({ ...p, clientId: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                >
                  <option value="">Selecione...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                  Imóvel
                </label>
                <select
                  value={scheduleForm.propertyId}
                  onChange={(e) => setScheduleForm((p) => ({ ...p, propertyId: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                >
                  <option value="">Selecione...</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    value={scheduleForm.scheduledAt}
                    onChange={(e) =>
                      setScheduleForm((p) => ({ ...p, scheduledAt: e.target.value }))
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm((p) => ({ ...p, time: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isModalLoading}
                  className="flex-1 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all disabled:opacity-50"
                >
                  {isModalLoading ? "..." : "Agendar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {selectedVisitForFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full mx-4 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Registrar Feedback</h3>
              <button
                onClick={() => setSelectedVisitForFeedback(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                  Feedback
                </label>
                <textarea
                  value={feedbackForm.feedback}
                  onChange={(e) =>
                    setFeedbackForm((p) => ({ ...p, feedback: e.target.value }))
                  }
                  placeholder="Observações da visita..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                  Status
                </label>
                <select
                  value={feedbackForm.status}
                  onChange={(e) =>
                    setFeedbackForm((p) => ({
                      ...p,
                      status: e.target.value as "COMPLETED" | "CANCELLED" | "NO_SHOW",
                    }))
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="COMPLETED">Realizada</option>
                  <option value="CANCELLED">Cancelada</option>
                  <option value="NO_SHOW">Não Compareceu</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedVisitForFeedback(null)}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isModalLoading}
                  className="flex-1 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all disabled:opacity-50"
                >
                  {isModalLoading ? "..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
