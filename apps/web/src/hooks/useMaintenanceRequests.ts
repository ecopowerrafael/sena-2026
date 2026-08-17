import { useEffect, useState } from "react";
import type { MaintenanceRequestDto, ServiceProviderDto } from "@sena/shared";
import { api, ApiRequestError } from "../services/apiClient";

interface CreateMaintenanceRequestDto {
  leaseId: string;
  description: string;
  priority?: string;
}

interface UseMaintenanceRequestsReturn {
  requests: MaintenanceRequestDto[];
  providers: ServiceProviderDto[];
  loading: boolean;
  error: string | null;
  loadRequests: (leaseId: string) => Promise<void>;
  loadProviders: () => Promise<void>;
  createRequest: (dto: CreateMaintenanceRequestDto) => Promise<MaintenanceRequestDto>;
}

export function useMaintenanceRequests(): UseMaintenanceRequestsReturn {
  const [requests, setRequests] = useState<MaintenanceRequestDto[]>([]);
  const [providers, setProviders] = useState<ServiceProviderDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = async (leaseId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<{ data: MaintenanceRequestDto[] }>(
        `/rentals/leases/${leaseId}/maintenance`
      );
      setRequests(response.data || []);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("Erro ao carregar solicitações de manutenção");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadProviders = async (): Promise<void> => {
    try {
      const response = await api.get<{ data: ServiceProviderDto[] }>(
        "/rentals/maintenance/providers"
      );
      setProviders(response.data || []);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      }
    }
  };

  const createRequest = async (dto: CreateMaintenanceRequestDto): Promise<MaintenanceRequestDto> => {
    const response = await api.post<{ data: MaintenanceRequestDto }>(
      "/rentals/maintenance/requests",
      dto
    );
    const request = response.data;
    setRequests((prev) => [request, ...prev]);
    return request;
  };

  useEffect(() => {
    loadProviders();
  }, []);

  return { requests, providers, loading, error, loadRequests, loadProviders, createRequest };
}
