import { useEffect, useState } from "react";
import type { DashboardMetricsDto } from "@sena/shared";
import { api, ApiRequestError } from "../services/apiClient";

interface UseDashboardAnalyticsReturn {
  metrics: DashboardMetricsDto | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useDashboardAnalytics(): UseDashboardAnalyticsReturn {
  const [metrics, setMetrics] = useState<DashboardMetricsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<{ data: DashboardMetricsDto }>(
        "/analytics/dashboard"
      );
      setMetrics(response.data || null);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("Erro ao carregar métricas");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { metrics, loading, error, refresh };
}
