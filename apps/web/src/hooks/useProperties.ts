import { useState, useEffect } from "react";
import { api, ApiRequestError } from "../services/apiClient";
import type { Property } from "../types/senaCrm";

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<{ data: Property[] }>("/properties");
      setProperties(response.data || []);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(`Erro ao carregar imóveis: ${err.message}`);
      } else {
        setError("Erro ao carregar imóveis");
      }
      console.error("Failed to load properties:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const addProperty = async (newProperty: Partial<Property>) => {
    try {
      const response = await api.post<{ data: Property }>("/properties", newProperty);
      const createdProperty = response.data;
      setProperties(prev => [createdProperty, ...prev]);
      return createdProperty;
    } catch (err) {
      if (err instanceof ApiRequestError) {
        throw new Error(`Erro ao criar imóvel: ${err.message}`);
      }
      throw err;
    }
  };

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    try {
      const response = await api.patch<{ data: Property }>(`/properties/${id}`, updates);
      const updatedProperty = response.data;
      setProperties(prev =>
        prev.map(p => (p.id === id ? updatedProperty : p))
      );
      return updatedProperty;
    } catch (err) {
      if (err instanceof ApiRequestError) {
        throw new Error(`Erro ao atualizar imóvel: ${err.message}`);
      }
      throw err;
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      await api.delete(`/properties/${id}`);
      setProperties(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      if (err instanceof ApiRequestError) {
        throw new Error(`Erro ao deletar imóvel: ${err.message}`);
      }
      throw err;
    }
  };

  return {
    properties,
    isLoading,
    error,
    addProperty,
    updateProperty,
    deleteProperty,
    reload: loadProperties,
  };
}
