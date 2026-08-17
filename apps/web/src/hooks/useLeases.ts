import { useEffect, useState } from "react";
import type { LeaseDto } from "@sena/shared";
import { api, ApiRequestError } from "../services/apiClient";

interface CreateLeaseDto {
  contractNumber: string;
  propertyId: string;
  responsibleBrokerId?: string;
  monthlyRent: number;
  startDate: string;
  endDate: string;
  dueDay: number;
  guaranteeType: string;
  adminFeePercentage: number;
}

interface UpdateLeaseDto {
  contractNumber?: string;
  monthlyRent?: number;
  adminFeePercentage?: number;
  status?: string;
  nextAdjustmentDate?: string;
}

interface AddLeaseTenantDto {
  clientId: string;
  percentage: number;
}

interface AddLeaseOwnerDto {
  clientId: string;
  percentage: number;
}

interface UseLeasesReturn {
  leases: LeaseDto[];
  loading: boolean;
  error: string | null;
  loadLeases: () => Promise<void>;
  createLease: (dto: CreateLeaseDto) => Promise<LeaseDto>;
  updateLease: (id: string, dto: UpdateLeaseDto) => Promise<LeaseDto>;
  addTenant: (leaseId: string, dto: AddLeaseTenantDto) => Promise<void>;
  addOwner: (leaseId: string, dto: AddLeaseOwnerDto) => Promise<void>;
}

export function useLeases(): UseLeasesReturn {
  const [leases, setLeases] = useState<LeaseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeases = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<{ data: LeaseDto[] }>("/rentals/leases");
      setLeases(response.data || []);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("Erro ao carregar contratos");
      }
    } finally {
      setLoading(false);
    }
  };

  const createLease = async (dto: CreateLeaseDto): Promise<LeaseDto> => {
    const response = await api.post<{ data: LeaseDto }>("/rentals/leases", dto);
    const lease = response.data;
    setLeases((prev) => [lease, ...prev]);
    return lease;
  };

  const updateLease = async (id: string, dto: UpdateLeaseDto): Promise<LeaseDto> => {
    const response = await api.patch<{ data: LeaseDto }>(`/rentals/leases/${id}`, dto);
    const updated = response.data;
    setLeases((prev) => prev.map((l) => (l.id === id ? updated : l)));
    return updated;
  };

  const addTenant = async (leaseId: string, dto: AddLeaseTenantDto): Promise<void> => {
    await api.post(`/rentals/leases/${leaseId}/tenants`, dto);
    await loadLeases();
  };

  const addOwner = async (leaseId: string, dto: AddLeaseOwnerDto): Promise<void> => {
    await api.post(`/rentals/leases/${leaseId}/owners`, dto);
    await loadLeases();
  };

  useEffect(() => {
    loadLeases();
  }, []);

  return { leases, loading, error, loadLeases, createLease, updateLease, addTenant, addOwner };
}
