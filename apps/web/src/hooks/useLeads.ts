import { useState, useEffect } from "react";
import { api, ApiRequestError } from "../services/apiClient";
import type { Lead, LeadStatus } from "../types/senaCrm";
import { mapLeadDtoToLead, mapLeadToUpdatePayload } from "../mappers/senaMappers";
import type { LeadDto } from "@sena/shared";

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all leads from API
  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const dtos = await api.get<LeadDto[]>("/leads");
      const mappedLeads = dtos.map(mapLeadDtoToLead);
      setLeads(mappedLeads);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(`Erro ao carregar leads: ${err.message}`);
      } else {
        setError("Erro ao carregar leads");
      }
      console.error("Failed to load leads:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const addLead = async (newLead: Partial<Lead>) => {
    try {
      const payload = {
        clientName: newLead.name || "Novo Cliente",
        clientPhone: newLead.phone || "(11) 90000-0000",
        clientWhatsapp: newLead.whatsapp || (newLead.phone || "").replace(/\D/g, ""),
        clientEmail: newLead.email || "cliente@email.com",
        clientType: newLead.type || "comprador",
        clientDocument: newLead.document || "000.000.000-00",
        assignedBrokerId: newLead.brokerId || "",
        originId: "", // Will use first origin if not provided
        status: "NEW",
        estimatedBudget: newLead.estimatedBudget || 2000000,
        notes: newLead.notes || "Lead cadastrado manualmente no CRM.",
      };

      const createdDto = await api.post<LeadDto>("/leads", payload);
      const mappedLead = mapLeadDtoToLead(createdDto);
      setLeads((prev) => [mappedLead, ...prev]);
      return mappedLead;
    } catch (err) {
      if (err instanceof ApiRequestError) {
        throw new Error(`Erro ao criar lead: ${err.message}`);
      }
      throw new Error("Erro ao criar lead");
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: LeadStatus, lostReason?: string) => {
    try {
      const updatePayload = mapLeadToUpdatePayload({ id: leadId } as Lead, newStatus, lostReason);
      const updatedDto = await api.patch<LeadDto>(`/leads/${leadId}/status`, updatePayload);
      const mappedLead = mapLeadDtoToLead(updatedDto);

      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? mappedLead : l))
      );
      return mappedLead;
    } catch (err) {
      if (err instanceof ApiRequestError) {
        throw new Error(`Erro ao atualizar status: ${err.message}`);
      }
      throw new Error("Erro ao atualizar status");
    }
  };

  return {
    leads,
    isLoading,
    error,
    addLead,
    updateLeadStatus,
    reloadLeads: loadLeads,
  };
}
