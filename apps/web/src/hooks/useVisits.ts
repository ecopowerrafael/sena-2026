import { useState, useEffect } from "react";
import { api, ApiRequestError } from "../services/apiClient";

export interface Visit {
  id: string;
  propertyId: string;
  clientId: string;
  scheduledAt: string;
  durationMinutes?: number;
  feedback?: string;
  impression?: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  createdAt: string;
  updatedAt: string;
}

export interface CreateVisitData {
  propertyId: string;
  clientId: string;
  scheduledAt: string;
  durationMinutes?: number;
}

export interface UpdateVisitData {
  scheduledAt?: string;
  durationMinutes?: number;
  feedback?: string;
  impression?: string;
  status?: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
}

export function useVisits() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVisits();
  }, []);

  const loadVisits = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<{ data: Visit[] }>("/visits");
      setVisits(response.data || []);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(`Erro ao carregar visitas: ${err.message}`);
      } else {
        setError("Erro ao carregar visitas");
      }
      console.error("Failed to load visits:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const createVisit = async (data: CreateVisitData) => {
    try {
      const response = await api.post<{ data: Visit }>("/visits", data);
      const createdVisit = response.data;
      setVisits((prev) => [createdVisit, ...prev]);
      return createdVisit;
    } catch (err) {
      if (err instanceof ApiRequestError) {
        throw new Error(`Erro ao criar visita: ${err.message}`);
      }
      throw err;
    }
  };

  const updateVisit = async (id: string, data: UpdateVisitData) => {
    try {
      const response = await api.patch<{ data: Visit }>(`/visits/${id}`, data);
      const updatedVisit = response.data;
      setVisits((prev) => prev.map((v) => (v.id === id ? updatedVisit : v)));
      return updatedVisit;
    } catch (err) {
      if (err instanceof ApiRequestError) {
        throw new Error(`Erro ao atualizar visita: ${err.message}`);
      }
      throw err;
    }
  };

  return {
    visits,
    isLoading,
    error,
    createVisit,
    updateVisit,
    reload: loadVisits,
  };
}
