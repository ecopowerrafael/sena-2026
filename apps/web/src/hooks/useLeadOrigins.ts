import { useState, useEffect } from "react";
import { api, ApiRequestError } from "../services/apiClient";

interface LeadOrigin {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export function useLeadOrigins() {
  const [origins, setOrigins] = useState<LeadOrigin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrigins();
  }, []);

  const loadOrigins = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.get<LeadOrigin[]>("/lead-origins");
      setOrigins(data);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(`Erro ao carregar origens: ${err.message}`);
      } else {
        setError("Erro ao carregar origens");
      }
      console.error("Failed to load origins:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    origins,
    isLoading,
    error,
    reloadOrigins: loadOrigins,
  };
}
