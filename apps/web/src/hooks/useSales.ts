import { useState, useEffect } from "react";
import { api, ApiRequestError } from "../services/apiClient";

export interface Sale {
  id: string;
  code: string;
  propertyId: string;
  buyerClientId: string;
  brokerId: string;
  captatorBrokerId?: string;
  proposalId?: string;
  finalSalePrice: number;
  saleDate: string;
  paymentType: string;
  contractNumber?: string;
  documentationStatus: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSaleData {
  paymentType?: string;
  contractNumber?: string;
  documentationStatus?: string;
  status?: string;
}

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<{ data: Sale[] }>("/sales");
      setSales(response.data || []);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(`Erro ao carregar vendas: ${err.message}`);
      } else {
        setError("Erro ao carregar vendas");
      }
      console.error("Failed to load sales:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSale = async (id: string, data: UpdateSaleData) => {
    try {
      const response = await api.patch<{ data: Sale }>(`/sales/${id}`, data);
      const updatedSale = response.data;
      setSales((prev) => prev.map((s) => (s.id === id ? updatedSale : s)));
      return updatedSale;
    } catch (err) {
      if (err instanceof ApiRequestError) {
        throw new Error(`Erro ao atualizar venda: ${err.message}`);
      }
      throw err;
    }
  };

  return {
    sales,
    isLoading,
    error,
    updateSale,
    reload: loadSales,
  };
}
