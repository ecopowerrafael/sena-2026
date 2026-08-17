import { useEffect, useState } from "react";
import type { ReportsDto } from "@sena/shared";
import { api, ApiRequestError } from "../services/apiClient";

interface ReportFilters {
  startDate?: string;
  endDate?: string;
  brokerId?: string;
  origin?: string;
  campaign?: string;
  operation?: string;
  developmentId?: string;
}

interface UseReportsReturn {
  reports: ReportsDto | null;
  loading: boolean;
  error: string | null;
  loadReports: (filters?: ReportFilters) => Promise<void>;
}

export function useReports(): UseReportsReturn {
  const [reports, setReports] = useState<ReportsDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReports = async (filters?: ReportFilters): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);
      if (filters?.brokerId) params.append("brokerId", filters.brokerId);
      if (filters?.origin) params.append("origin", filters.origin);
      if (filters?.campaign) params.append("campaign", filters.campaign);
      if (filters?.operation) params.append("operation", filters.operation);
      if (filters?.developmentId) params.append("developmentId", filters.developmentId);

      const response = await api.get<{ data: ReportsDto }>(
        `/analytics/reports${params.toString() ? `?${params.toString()}` : ""}`
      );
      setReports(response.data || null);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("Erro ao carregar relatórios");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  return { reports, loading, error, loadReports };
}
