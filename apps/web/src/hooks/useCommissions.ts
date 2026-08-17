import { useState, useEffect } from "react";
import { api, ApiRequestError } from "../services/apiClient";

export interface CommissionSplit {
  id: string;
  recipientType: string;
  recipientId: string;
  percentage: number;
  amount: number;
  status: string;
}

export interface Commission {
  id: string;
  saleId: string;
  baseValue: number;
  totalPercentage: number;
  totalValue: number;
  status: string;
  expectedAt: string;
  paidAt?: string;
  splits: CommissionSplit[];
  createdAt: string;
  updatedAt: string;
}

export function useCommissions() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCommissions();
  }, []);

  const loadCommissions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<{ data: Commission[] }>("/commissions");
      setCommissions(response.data || []);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(`Erro ao carregar comissões: ${err.message}`);
      } else {
        setError("Erro ao carregar comissões");
      }
      console.error("Failed to load commissions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getCommissionsBySale = async (saleId: string) => {
    try {
      const response = await api.get<{ data: Commission[] }>(`/commissions/by-sale/${saleId}`);
      return response.data || [];
    } catch (err) {
      if (err instanceof ApiRequestError) {
        throw new Error(`Erro ao carregar comissões da venda: ${err.message}`);
      }
      throw err;
    }
  };

  return {
    commissions,
    isLoading,
    error,
    getCommissionsBySale,
    reload: loadCommissions,
  };
}
