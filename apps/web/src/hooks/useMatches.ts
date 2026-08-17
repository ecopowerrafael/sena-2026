import { useState, useEffect } from "react";
import { api, ApiRequestError } from "../services/apiClient";

export interface PropertyMatch {
  property: {
    id: string;
    code: string;
    title: string;
    type: string;
    purpose: string;
    salePrice?: number;
    rentalPrice?: number;
    bedrooms?: number;
    suites?: number;
    bathrooms?: number;
    parkingSpots?: number;
    neighborhood: string;
    city: string;
    state: string;
  };
  score: number;
  reasons: string[];
}

export function useMatches(clientId: string | null) {
  const [matches, setMatches] = useState<PropertyMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clientId) {
      loadMatches();
    }
  }, [clientId]);

  const loadMatches = async () => {
    if (!clientId) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<{ data: PropertyMatch[] }>(`/clients/${clientId}/matches`);
      setMatches(response.data || []);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.status === 404) {
          setMatches([]);
        } else {
          setError(`Erro ao carregar matches: ${err.message}`);
        }
      } else {
        setError("Erro ao carregar matches");
      }
      console.error("Failed to load matches:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    matches,
    isLoading,
    error,
    reload: loadMatches,
  };
}
