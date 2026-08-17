import { useEffect, useState } from "react";
import type { RentChargeDto, OwnerPayoutDto } from "@sena/shared";
import { api, ApiRequestError } from "../services/apiClient";

interface CreateRentChargeDto {
  leaseId: string;
  competence: string;
  dueDate: string;
  rentAmount: number;
  condoAmount?: number;
  iptuAmount?: number;
  otherAmount?: number;
  discountAmount?: number;
  fineAmount?: number;
  interestAmount?: number;
}

interface CreateRentPaymentDto {
  chargeId: string;
  amount: number;
  paymentDate: string;
  receiptUrl?: string;
  notes?: string;
}

interface AddRentalExpenseDto {
  leaseId: string;
  competence: string;
  description: string;
  amount: number;
}

interface UseChargesReturn {
  charges: RentChargeDto[];
  payouts: OwnerPayoutDto[];
  loading: boolean;
  error: string | null;
  loadCharges: (leaseId: string) => Promise<void>;
  loadPayouts: (leaseId: string) => Promise<void>;
  createCharge: (dto: CreateRentChargeDto) => Promise<RentChargeDto>;
  recordPayment: (dto: CreateRentPaymentDto) => Promise<void>;
  addExpense: (dto: AddRentalExpenseDto) => Promise<void>;
}

export function useCharges(): UseChargesReturn {
  const [charges, setCharges] = useState<RentChargeDto[]>([]);
  const [payouts, setPayouts] = useState<OwnerPayoutDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCharges = async (leaseId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<{ data: RentChargeDto[] }>(
        `/rentals/leases/${leaseId}/charges`
      );
      setCharges(response.data || []);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("Erro ao carregar cobranças");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPayouts = async (leaseId: string): Promise<void> => {
    try {
      setError(null);
      const response = await api.get<{ data: OwnerPayoutDto[] }>(
        `/rentals/leases/${leaseId}/payouts`
      );
      setPayouts(response.data || []);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      }
    }
  };

  const createCharge = async (dto: CreateRentChargeDto): Promise<RentChargeDto> => {
    const response = await api.post<{ data: RentChargeDto }>("/rentals/charges", dto);
    const charge = response.data;
    setCharges((prev) => [charge, ...prev]);
    return charge;
  };

  const recordPayment = async (dto: CreateRentPaymentDto): Promise<void> => {
    await api.post("/rentals/charges/payments", dto);
    // Recarregar cobranças após pagamento (status pode ter mudado)
    const charge = charges.find((c) => c.id === dto.chargeId);
    if (charge) {
      await loadCharges(charge.leaseId);
    }
  };

  const addExpense = async (dto: AddRentalExpenseDto): Promise<void> => {
    await api.post("/rentals/charges/expenses", dto);
  };

  return {
    charges,
    payouts,
    loading,
    error,
    loadCharges,
    loadPayouts,
    createCharge,
    recordPayment,
    addExpense,
  };
}
