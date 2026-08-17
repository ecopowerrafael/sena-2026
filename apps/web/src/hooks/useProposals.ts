import { useState, useEffect } from "react";
import { api, ApiRequestError } from "../services/apiClient";

export interface Proposal {
  id: string;
  code: string;
  propertyId: string;
  clientId: string;
  brokerId: string;
  advertisedPrice: number;
  proposedPrice: number;
  downPayment?: number;
  installmentsCount?: number;
  installmentsValue?: number;
  paymentMethod?: string;
  paymentDescription?: string;
  counterProposalPrice?: number;
  counterProposalNotes?: string;
  status: "DRAFT" | "SUBMITTED" | "COUNTER_PROPOSED" | "APPROVED" | "REJECTED" | "EXPIRED";
  createdAt: string;
  updatedAt: string;
}

export interface CreateProposalData {
  propertyId: string;
  clientId: string;
  advertisedPrice: number;
  proposedPrice: number;
  downPayment?: number;
  installmentsCount?: number;
  installmentsValue?: number;
  paymentMethod?: string;
  paymentDescription?: string;
}

export interface UpdateProposalData {
  proposedPrice?: number;
  downPayment?: number;
  counterProposalPrice?: number;
  counterProposalNotes?: string;
  status?: string;
}

export interface ApproveProposalData {
  finalSalePrice: number;
  saleDate: string;
  paymentType: string;
  contractNumber?: string;
}

export function useProposals() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<{ data: Proposal[] }>("/proposals");
      setProposals(response.data || []);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(`Erro ao carregar propostas: ${err.message}`);
      } else {
        setError("Erro ao carregar propostas");
      }
      console.error("Failed to load proposals:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const createProposal = async (data: CreateProposalData) => {
    try {
      const response = await api.post<{ data: Proposal }>("/proposals", data);
      const createdProposal = response.data;
      setProposals((prev) => [createdProposal, ...prev]);
      return createdProposal;
    } catch (err) {
      if (err instanceof ApiRequestError) {
        throw new Error(`Erro ao criar proposta: ${err.message}`);
      }
      throw err;
    }
  };

  const updateProposal = async (id: string, data: UpdateProposalData) => {
    try {
      const response = await api.patch<{ data: Proposal }>(`/proposals/${id}`, data);
      const updatedProposal = response.data;
      setProposals((prev) => prev.map((p) => (p.id === id ? updatedProposal : p)));
      return updatedProposal;
    } catch (err) {
      if (err instanceof ApiRequestError) {
        throw new Error(`Erro ao atualizar proposta: ${err.message}`);
      }
      throw err;
    }
  };

  const approveProposal = async (id: string, data: ApproveProposalData) => {
    try {
      const response = await api.post(`/proposals/${id}/approve`, data);
      // Reload proposals after approval
      await loadProposals();
      return response;
    } catch (err) {
      if (err instanceof ApiRequestError) {
        throw new Error(`Erro ao aprovar proposta: ${err.message}`);
      }
      throw err;
    }
  };

  return {
    proposals,
    isLoading,
    error,
    createProposal,
    updateProposal,
    approveProposal,
    reload: loadProposals,
  };
}
