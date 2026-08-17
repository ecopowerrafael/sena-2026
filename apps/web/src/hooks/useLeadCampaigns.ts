import { useState, useEffect } from "react";
import { api, ApiRequestError } from "../services/apiClient";

interface LeadCampaign {
  id: string;
  name: string;
  originId: string | null;
  isActive: boolean;
}

export function useLeadCampaigns() {
  const [campaigns, setCampaigns] = useState<LeadCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.get<LeadCampaign[]>("/campaigns");
      setCampaigns(data);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(`Erro ao carregar campanhas: ${err.message}`);
      } else {
        setError("Erro ao carregar campanhas");
      }
      console.error("Failed to load campaigns:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    campaigns,
    isLoading,
    error,
    reloadCampaigns: loadCampaigns,
  };
}
