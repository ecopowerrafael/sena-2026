import { useState } from "react";
import { api, ApiRequestError } from "../services/apiClient";

export interface InterestProfile {
  id: string;
  clientId: string;
  objective: "BUY" | "RENT";
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minSuites?: number;
  minParkingSpots?: number;
  paymentMethod?: string[];
  needsFinancing?: boolean;
  notes?: string;
  preferredNeighborhoods?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateInterestProfileData {
  objective?: "BUY" | "RENT";
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minSuites?: number;
  minParkingSpots?: number;
  paymentMethod?: string[];
  needsFinancing?: boolean;
  notes?: string;
  preferredNeighborhoods?: string;
}

export function useInterestProfile(clientId: string | null) {
  const [profile, setProfile] = useState<InterestProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    if (!clientId) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<{ data: InterestProfile }>(`/clients/${clientId}/interest-profile`);
      setProfile(response.data);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.status === 404) {
          setProfile(null);
        } else {
          setError(`Erro ao carregar perfil: ${err.message}`);
        }
      } else {
        setError("Erro ao carregar perfil");
      }
      console.error("Failed to load interest profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async (data: UpdateInterestProfileData) => {
    if (!clientId) throw new Error("Client ID is required");
    try {
      setError(null);
      const response = await api.patch<{ data: InterestProfile }>(
        `/clients/${clientId}/interest-profile`,
        data
      );
      setProfile(response.data);
      return response.data;
    } catch (err) {
      if (err instanceof ApiRequestError) {
        throw new Error(`Erro ao salvar perfil: ${err.message}`);
      }
      throw err;
    }
  };

  return {
    profile,
    isLoading,
    error,
    loadProfile,
    saveProfile,
  };
}
