import { useState, useEffect } from "react";
import { api, ApiRequestError } from "../services/apiClient";
import type { Broker } from "../types/senaCrm";
import { mapBrokerDtoToBroker } from "../mappers/senaMappers";
import type { BrokerDto } from "@sena/shared";

export function useBrokers() {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all brokers from API
  useEffect(() => {
    loadBrokers();
  }, []);

  const loadBrokers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const dtos = await api.get<BrokerDto[]>("/brokers");
      const mappedBrokers = dtos.map(mapBrokerDtoToBroker);
      setBrokers(mappedBrokers);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(`Erro ao carregar corretores: ${err.message}`);
      } else {
        setError("Erro ao carregar corretores");
      }
      console.error("Failed to load brokers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const addBroker = async (newBrokerPayload: any) => {
    try {
      const payload = {
        name: newBrokerPayload.name,
        email: newBrokerPayload.email,
        phone: newBrokerPayload.phone || "(11) 98888-0000",
        password: newBrokerPayload.password,
        creci: newBrokerPayload.creci,
        teamName: newBrokerPayload.teamName,
        whatsapp: newBrokerPayload.whatsapp,
        role: newBrokerPayload.role || "BROKER",
        managerUserId: newBrokerPayload.managerUserId,
      };

      const createdDto = await api.post<BrokerDto>("/brokers", payload);
      const mappedBroker = mapBrokerDtoToBroker(createdDto);
      setBrokers((prev) => [...prev, mappedBroker]);
      return mappedBroker;
    } catch (err) {
      if (err instanceof ApiRequestError) {
        throw new Error(`Erro ao criar corretor: ${err.message}`);
      }
      throw new Error("Erro ao criar corretor");
    }
  };

  return {
    brokers,
    isLoading,
    error,
    addBroker,
    reloadBrokers: loadBrokers,
  };
}
