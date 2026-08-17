import { useEffect, useState } from "react";
import type { DevelopmentDto } from "@sena/shared";
import { api, ApiRequestError } from "../services/apiClient";

interface UseDevelopmentsReturn {
  developments: DevelopmentDto[];
  loading: boolean;
  error: string | null;
  loadDevelopments: () => Promise<void>;
}

export function useDevelopments(): UseDevelopmentsReturn {
  const [developments, setDevelopments] = useState<DevelopmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDevelopments = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<{ data: DevelopmentDto[] }>("/developments");
      setDevelopments(response.data || []);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("Erro ao carregar empreendimentos");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevelopments();
  }, []);

  return { developments, loading, error, loadDevelopments };
}
