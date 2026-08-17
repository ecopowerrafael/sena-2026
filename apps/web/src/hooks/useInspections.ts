import { useEffect, useState } from "react";
import type { InspectionDto } from "@sena/shared";
import { api, ApiRequestError } from "../services/apiClient";

interface CreateInspectionDto {
  leaseId: string;
  inspectionType: "ENTRY" | "PERIODIC" | "EXIT";
  inspectorName?: string;
  notes?: string;
  items?: Array<{
    description: string;
    status: string;
    notes?: string;
  }>;
}

interface UseInspectionsReturn {
  inspections: InspectionDto[];
  loading: boolean;
  error: string | null;
  loadInspections: (leaseId: string) => Promise<void>;
  createInspection: (dto: CreateInspectionDto) => Promise<InspectionDto>;
}

export function useInspections(): UseInspectionsReturn {
  const [inspections, setInspections] = useState<InspectionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInspections = async (leaseId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<{ data: InspectionDto[] }>(
        `/rentals/leases/${leaseId}/inspections`
      );
      setInspections(response.data || []);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("Erro ao carregar inspeções");
      }
    } finally {
      setLoading(false);
    }
  };

  const createInspection = async (dto: CreateInspectionDto): Promise<InspectionDto> => {
    const response = await api.post<{ data: InspectionDto }>("/rentals/inspections", dto);
    const inspection = response.data;
    setInspections((prev) => [inspection, ...prev]);
    return inspection;
  };

  return { inspections, loading, error, loadInspections, createInspection };
}
