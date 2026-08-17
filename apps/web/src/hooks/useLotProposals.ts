import { useEffect, useState } from "react";
import type { LotProposalDto, LotSaleDto } from "@sena/shared";
import { api, ApiRequestError } from "../services/apiClient";

interface CreateLotProposalDto {
  lotId: string;
  clientId: string;
  proposedPrice: number;
  entryAmount: number;
  installments: number;
  interestRate?: number;
}

interface ApproveLotProposalDto {
  finalPrice: number;
  saleDate: string;
  contractNumber?: string;
}

interface UseLotProposalsReturn {
  proposals: LotProposalDto[];
  sales: LotSaleDto[];
  loading: boolean;
  error: string | null;
  loadProposals: (developmentId: string) => Promise<void>;
  loadSales: (developmentId: string) => Promise<void>;
  createProposal: (dto: CreateLotProposalDto) => Promise<LotProposalDto>;
  approveProposal: (proposalId: string, dto: ApproveLotProposalDto) => Promise<LotSaleDto>;
}

export function useLotProposals(): UseLotProposalsReturn {
  const [proposals, setProposals] = useState<LotProposalDto[]>([]);
  const [sales, setSales] = useState<LotSaleDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProposals = async (developmentId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<{ data: LotProposalDto[] }>(
        `/developments/${developmentId}/proposals`
      );
      setProposals(response.data || []);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("Erro ao carregar propostas");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSales = async (developmentId: string): Promise<void> => {
    try {
      const response = await api.get<{ data: LotSaleDto[] }>(
        `/developments/${developmentId}/sales`
      );
      setSales(response.data || []);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      }
    }
  };

  const createProposal = async (dto: CreateLotProposalDto): Promise<LotProposalDto> => {
    const response = await api.post<{ data: LotProposalDto }>("/developments/proposals", dto);
    const proposal = response.data;
    setProposals((prev) => [proposal, ...prev]);
    return proposal;
  };

  const approveProposal = async (
    proposalId: string,
    dto: ApproveLotProposalDto
  ): Promise<LotSaleDto> => {
    const response = await api.post<{ data: LotSaleDto }>(
      `/developments/proposals/${proposalId}/approve`,
      dto
    );
    const sale = response.data;
    setSales((prev) => [sale, ...prev]);
    setProposals((prev) => prev.filter((p) => p.id !== proposalId));
    return sale;
  };

  return {
    proposals,
    sales,
    loading,
    error,
    loadProposals,
    loadSales,
    createProposal,
    approveProposal,
  };
}
