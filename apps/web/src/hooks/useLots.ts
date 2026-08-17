import { useEffect, useState } from "react";
import type { LotDto, LotReservationDto, LotSimulationDto } from "@sena/shared";
import { api, ApiRequestError } from "../services/apiClient";

interface ReserveLotDto {
  lotId: string;
  clientId: string;
  expiresAt: string;
}

interface SimulateLotDto {
  lotId: string;
  clientId?: string;
  entryAmount: number;
  installments: number;
  discountAmount?: number;
  interestRate?: number;
}

interface UseLotsReturn {
  lots: LotDto[];
  reservations: Map<string, LotReservationDto>;
  simulations: LotSimulationDto[];
  loading: boolean;
  error: string | null;
  loadLots: (developmentId: string) => Promise<void>;
  reserveLot: (dto: ReserveLotDto) => Promise<LotReservationDto>;
  getReservation: (lotId: string) => Promise<LotReservationDto | null>;
  simulateLot: (dto: SimulateLotDto) => Promise<LotSimulationDto>;
}

export function useLots(): UseLotsReturn {
  const [lots, setLots] = useState<LotDto[]>([]);
  const [reservations, setReservations] = useState<Map<string, LotReservationDto>>(new Map());
  const [simulations, setSimulations] = useState<LotSimulationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLots = async (developmentId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<{ data: LotDto[] }>(
        `/developments/${developmentId}/lots`
      );
      setLots(response.data || []);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("Erro ao carregar lotes");
      }
    } finally {
      setLoading(false);
    }
  };

  const reserveLot = async (dto: ReserveLotDto): Promise<LotReservationDto> => {
    const response = await api.post<{ data: LotReservationDto }>(
      "/developments/lots/reserve",
      dto
    );
    const reservation = response.data;

    // Atualizar status do lote localmente
    setLots((prev) =>
      prev.map((lot) =>
        lot.id === dto.lotId ? { ...lot, status: "RESERVED" as const } : lot
      )
    );

    // Armazenar reserva
    setReservations((prev) => new Map(prev).set(dto.lotId, reservation));
    return reservation;
  };

  const getReservation = async (lotId: string): Promise<LotReservationDto | null> => {
    try {
      const response = await api.get<{ data: LotReservationDto | null }>(
        `/developments/lots/${lotId}/reservation`
      );
      const reservation = response.data;

      if (reservation) {
        setReservations((prev) => new Map(prev).set(lotId, reservation));
      }

      return reservation;
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      }
      return null;
    }
  };

  const simulateLot = async (dto: SimulateLotDto): Promise<LotSimulationDto> => {
    const response = await api.post<{ data: LotSimulationDto }>(
      "/developments/lots/simulate",
      dto
    );
    const simulation = response.data;

    setSimulations((prev) => [simulation, ...prev]);
    return simulation;
  };

  return {
    lots,
    reservations,
    simulations,
    loading,
    error,
    loadLots,
    reserveLot,
    getReservation,
    simulateLot,
  };
}
