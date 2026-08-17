import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import type { AuthContext } from "../auth/auth.types";
import type { LotDto, LotReservationDto, LotSimulationDto } from "@sena/shared";
import { CreateLotDto, ReserveLotDto, SimulateLotDto } from "./developments.dto";

@Injectable()
export class LotsService {
  constructor(private readonly prisma: PrismaService) {}

  async listByDevelopment(auth: AuthContext, developmentId: string): Promise<LotDto[]> {
    const dev = await this.prisma.development.findUnique({
      where: { id: developmentId },
    });

    if (!dev || dev.tenantId !== auth.tenantId) {
      throw new NotFoundException("Empreendimento não encontrado");
    }

    const lots = await this.prisma.lot.findMany({
      where: { developmentId },
      orderBy: { lotNumber: "asc" },
    });

    return lots.map((l) => this.toDto(l));
  }

  async findById(auth: AuthContext, id: string): Promise<LotDto> {
    const lot = await this.prisma.lot.findUnique({ where: { id } });

    if (!lot || lot.tenantId !== auth.tenantId) {
      throw new NotFoundException("Lote não encontrado");
    }

    return this.toDto(lot);
  }

  async create(auth: AuthContext, dto: CreateLotDto): Promise<LotDto> {
    const dev = await this.prisma.development.findUnique({
      where: { id: dto.developmentId },
    });

    if (!dev || dev.tenantId !== auth.tenantId) {
      throw new NotFoundException("Empreendimento não encontrado");
    }

    const block = await this.prisma.developmentBlock.findUnique({
      where: { id: dto.blockId },
    });

    if (!block || block.developmentId !== dto.developmentId) {
      throw new NotFoundException("Quadra não encontrada");
    }

    const lot = await this.prisma.lot.create({
      data: {
        tenantId: auth.tenantId,
        developmentId: dto.developmentId,
        blockId: dto.blockId,
        lotNumber: dto.lotNumber,
        areaM2: dto.areaM2,
        basePrice: dto.basePrice,
        promotionalPrice: dto.promotionalPrice,
        minDownPayment: dto.minDownPayment,
        maxInstallments: dto.maxInstallments || 120,
        status: "AVAILABLE",
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        userId: auth.userId,
        action: "LOT_CREATED",
        entity: "Lot",
        entityId: lot.id,
        metadata: { developmentId: dto.developmentId, lotNumber: dto.lotNumber },
      },
    });

    return this.toDto(lot);
  }

  async reserve(auth: AuthContext, dto: ReserveLotDto): Promise<LotReservationDto> {
    const lot = await this.prisma.lot.findUnique({
      where: { id: dto.lotId },
    });

    if (!lot || lot.tenantId !== auth.tenantId) {
      throw new NotFoundException("Lote não encontrado");
    }

    // Proteção contra dupla reserva: transaction garante atomicidade
    const reservation = await this.prisma.$transaction(async (tx) => {
      // Re-verificar status dentro da transação
      const currentLot = await tx.lot.findUnique({ where: { id: dto.lotId } });

      if (currentLot?.status !== "AVAILABLE") {
        throw new ConflictException("Lote não está disponível para reserva");
      }

      // Criar reserva
      const res = await tx.lotReservation.create({
        data: {
          tenantId: auth.tenantId,
          lotId: dto.lotId,
          clientId: dto.clientId,
          brokerId: auth.userId,
          expiresAt: new Date(dto.expiresAt),
          status: "ACTIVE",
        },
      });

      // Atualizar status do lote
      await tx.lot.update({
        where: { id: dto.lotId },
        data: { status: "RESERVED" },
      });

      return res;
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        userId: auth.userId,
        action: "LOT_RESERVED",
        entity: "LotReservation",
        entityId: reservation.id,
        metadata: { lotId: dto.lotId, clientId: dto.clientId },
      },
    });

    return this.reservationToDto(reservation);
  }

  async getReservation(auth: AuthContext, lotId: string): Promise<LotReservationDto | null> {
    const reservation = await this.prisma.lotReservation.findUnique({
      where: { lotId },
    });

    if (reservation && reservation.tenantId !== auth.tenantId) {
      throw new BadRequestException("Acesso negado");
    }

    return reservation ? this.reservationToDto(reservation) : null;
  }

  async simulate(auth: AuthContext, dto: SimulateLotDto): Promise<LotSimulationDto> {
    const lot = await this.prisma.lot.findUnique({ where: { id: dto.lotId } });

    if (!lot || lot.tenantId !== auth.tenantId) {
      throw new NotFoundException("Lote não encontrado");
    }

    const salePrice = dto.entryAmount > 0 ? Number(lot.basePrice) : Number(lot.basePrice);
    const discountAmount = dto.discountAmount || 0;
    const financedBalance = salePrice - dto.entryAmount - discountAmount;
    const interestRate = dto.interestRate || 0;

    // Cálculo simplificado de parcela com juros
    const monthlyRate = interestRate / 100 / 12;
    const installmentValue =
      monthlyRate > 0
        ? (financedBalance * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -dto.installments))
        : financedBalance / dto.installments;

    const simulation = await this.prisma.lotSimulation.create({
      data: {
        tenantId: auth.tenantId,
        lotId: dto.lotId,
        clientId: dto.clientId,
        brokerId: auth.userId,
        entryAmount: dto.entryAmount,
        installments: dto.installments,
        discountAmount,
        financedBalance,
        interestRate: dto.interestRate,
        installmentValue,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        userId: auth.userId,
        action: "SIMULATION_CREATED",
        entity: "LotSimulation",
        entityId: simulation.id,
        metadata: { lotId: dto.lotId, installments: dto.installments },
      },
    });

    return this.simulationToDto(simulation);
  }

  private toDto(lot: any): LotDto {
    return {
      id: lot.id,
      developmentId: lot.developmentId,
      blockId: lot.blockId,
      lotNumber: lot.lotNumber,
      areaM2: Number(lot.areaM2),
      basePrice: Number(lot.basePrice),
      promotionalPrice: lot.promotionalPrice ? Number(lot.promotionalPrice) : null,
      minDownPayment: Number(lot.minDownPayment),
      maxInstallments: lot.maxInstallments,
      status: lot.status,
      createdAt: lot.createdAt.toISOString(),
      updatedAt: lot.updatedAt.toISOString(),
    };
  }

  private reservationToDto(res: any): LotReservationDto {
    return {
      id: res.id,
      lotId: res.lotId,
      clientId: res.clientId,
      brokerId: res.brokerId,
      reservedAt: res.reservedAt.toISOString(),
      expiresAt: res.expiresAt.toISOString(),
      status: res.status,
      createdAt: res.createdAt.toISOString(),
    };
  }

  private simulationToDto(sim: any): LotSimulationDto {
    return {
      id: sim.id,
      lotId: sim.lotId,
      clientId: sim.clientId,
      brokerId: sim.brokerId,
      entryAmount: Number(sim.entryAmount),
      installments: sim.installments,
      discountAmount: Number(sim.discountAmount),
      financedBalance: Number(sim.financedBalance),
      interestRate: sim.interestRate ? Number(sim.interestRate) : null,
      installmentValue: Number(sim.installmentValue),
      createdAt: sim.createdAt.toISOString(),
    };
  }
}
