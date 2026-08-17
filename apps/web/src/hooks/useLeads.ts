import { useState, useEffect } from "react";
import { api, ApiRequestError } from "../services/apiClient";
import type { Lead, LeadStatus } from "../types/senaCrm";
import { mapLeadDtoToLead, mapLeadToUpdatePayload } from "../mappers/senaMappers";
import type { LeadDto } from "@sena/shared";

interface LeadOrigin {
  id: string;
  name: string;
}

export function useLeads(origins: LeadOrigin[] = []) {
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
      if (origins.length === 0) {
        throw new Error("Nenhuma origem de lead disponível. Configure as origens de lead primeiro.");
      }

      // Build inline client object with expected structure
      const client = {
        name: newLead.name || "Novo Cliente",
        type: "PERSON", // Map from "comprador" to "PERSON"
        document: newLead.document || "000.000.000-00",
        phone: newLead.phone || "(11) 90000-0000",
        whatsapp: newLead.whatsapp || (newLead.phone || "").replace(/\D/g, ""),
        email: newLead.email || "cliente@email.com",
        roles: ["BUYER"], // Map from "comprador" to ["BUYER"]
      };

      const payload = {
        client,
        assignedBrokerId: newLead.brokerId,
        originId: origins[0]!.id, // Use first available origin
        campaignName: newLead.campaign || undefined,
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
