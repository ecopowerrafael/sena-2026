import { useState, useEffect } from "react";
import { api, ApiRequestError } from "../services/apiClient";
import type { ClientDto } from "@sena/shared";

export function useClients() {
  const [clients, setClients] = useState<ClientDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<{ data: ClientDto[] }>("/clients");
      setClients(response.data || []);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(`Erro ao carregar clientes: ${err.message}`);
      } else {
        setError("Erro ao carregar clientes");
      }
      console.error("Failed to load clients:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const addClient = async (newClient: Partial<ClientDto>) => {
    try {
      const response = await api.post<{ data: ClientDto }>("/clients", newClient);
      const createdClient = response.data;
      setClients(prev => [createdClient, ...prev]);
      return createdClient;
    } catch (err) {
      if (err instanceof ApiRequestError) {
        throw new Error(`Erro ao criar cliente: ${err.message}`);
      }
      throw err;
    }
  };

  const updateClient = async (id: string, updates: Partial<ClientDto>) => {
    try {
      const response = await api.patch<{ data: ClientDto }>(`/clients/${id}`, updates);
      const updatedClient = response.data;
      setClients(prev =>
        prev.map(c => (c.id === id ? updatedClient : c))
      );
      return updatedClient;
    } catch (err) {
      if (err instanceof ApiRequestError) {
        throw new Error(`Erro ao atualizar cliente: ${err.message}`);
      }
      throw err;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      await api.delete(`/clients/${id}`);
      setClients(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      if (err instanceof ApiRequestError) {
        throw new Error(`Erro ao deletar cliente: ${err.message}`);
      }
      throw err;
    }
  };

  return {
    clients,
    isLoading,
    error,
    addClient,
    updateClient,
    deleteClient,
    reload: loadClients,
  };
}
