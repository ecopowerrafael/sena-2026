import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import type { AuthContext } from "../auth/auth.types";
import type { RentChargeDto, OwnerPayoutDto } from "@sena/shared";
import { CreateRentChargeDto, CreateRentPaymentDto, AddRentalExpenseDto } from "./rentals.dto";

@Injectable()
export class ChargesService {
  constructor(private readonly prisma: PrismaService) {}

  async listCharges(auth: AuthContext, leaseId: string): Promise<RentChargeDto[]> {
    const lease = await this.prisma.lease.findUnique({ where: { id: leaseId } });

    if (!lease || lease.tenantId !== auth.tenantId) {
      throw new NotFoundException("Contrato não encontrado");
    }

    const charges = await this.prisma.rentCharge.findMany({
      where: { leaseId },
      orderBy: { competence: "desc" },
    });

    return charges.map((c) => this.chargeToDto(c));
  }

  async createCharge(auth: AuthContext, dto: CreateRentChargeDto): Promise<RentChargeDto> {
    const lease = await this.prisma.lease.findUnique({
      where: { id: dto.leaseId },
    });

    if (!lease || lease.tenantId !== auth.tenantId) {
      throw new NotFoundException("Contrato não encontrado");
    }

    const otherAmount = dto.otherAmount || 0;
    const discountAmount = dto.discountAmount || 0;
    const fineAmount = dto.fineAmount || 0;
    const interestAmount = dto.interestAmount || 0;

    const totalAmount =
      dto.rentAmount + dto.condoAmount + dto.iptuAmount + otherAmount - discountAmount + fineAmount + interestAmount;

    const charge = await this.prisma.rentCharge.create({
      data: {
        tenantId: auth.tenantId,
        leaseId: dto.leaseId,
        competence: new Date(dto.competence),
        dueDate: new Date(dto.dueDate),
        rentAmount: dto.rentAmount,
        condoAmount: dto.condoAmount,
        iptuAmount: dto.iptuAmount,
        otherAmount,
        discountAmount,
        fineAmount,
        interestAmount,
        totalAmount,
        status: "PENDING",
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        userId: auth.userId,
        action: "CHARGE_CREATED",
        entity: "RentCharge",
        entityId: charge.id,
        metadata: { leaseId: dto.leaseId, competence: dto.competence, totalAmount },
      },
    });

    return this.chargeToDto(charge);
  }

  async recordPayment(auth: AuthContext, dto: CreateRentPaymentDto): Promise<void> {
    const charge = await this.prisma.rentCharge.findUnique({
      where: { id: dto.chargeId },
      include: { lease: true },
    });

    if (!charge || charge.tenantId !== auth.tenantId) {
      throw new NotFoundException("Cobrança não encontrada");
    }

    const chargeTotal = Number(charge.totalAmount);
    if (dto.amount > chargeTotal) {
      throw new BadRequestException("Valor de pagamento não pode ser maior que o total da cobrança");
    }

    await this.prisma.rentPayment.create({
      data: {
        tenantId: auth.tenantId,
        chargeId: dto.chargeId,
        amount: dto.amount,
        paymentDate: new Date(dto.paymentDate),
        receiptUrl: dto.receiptUrl,
        notes: dto.notes,
      },
    });

    // Calcular status da cobrança
    const payments = await this.prisma.rentPayment.findMany({
      where: { chargeId: dto.chargeId },
    });

    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const status =
      totalPaid >= chargeTotal ? "PAID" : totalPaid > 0 ? "PARTIAL" : "PENDING";

    await this.prisma.rentCharge.update({
      where: { id: dto.chargeId },
      data: { status },
    });

    // Se pagamento completo, calcular repasse aos proprietários
    if (status === "PAID") {
      await this.calculateOwnerPayouts(auth.tenantId, charge.leaseId, charge.competence);
    }

    await this.prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        userId: auth.userId,
        action: "PAYMENT_RECORDED",
        entity: "RentPayment",
        entityId: charge.id,
        metadata: { amount: dto.amount },
      },
    });
  }

  async addExpense(auth: AuthContext, dto: AddRentalExpenseDto): Promise<void> {
    const lease = await this.prisma.lease.findUnique({
      where: { id: dto.leaseId },
    });

    if (!lease || lease.tenantId !== auth.tenantId) {
      throw new NotFoundException("Contrato não encontrado");
    }

    await this.prisma.rentalExpense.create({
      data: {
        tenantId: auth.tenantId,
        leaseId: dto.leaseId,
        competence: new Date(dto.competence),
        description: dto.description,
        amount: dto.amount,
        isAuthorized: false,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        userId: auth.userId,
        action: "EXPENSE_ADDED",
        entity: "RentalExpense",
        entityId: dto.leaseId,
        metadata: { description: dto.description, amount: dto.amount },
      },
    });
  }

  async listPayouts(auth: AuthContext, leaseId: string): Promise<OwnerPayoutDto[]> {
    const lease = await this.prisma.lease.findUnique({ where: { id: leaseId } });

    if (!lease || lease.tenantId !== auth.tenantId) {
      throw new NotFoundException("Contrato não encontrado");
    }

    const payouts = await this.prisma.ownerPayout.findMany({
      where: { leaseId },
      include: { ownerClient: true },
      orderBy: { competence: "desc" },
    });

    return payouts.map((p) => this.payoutToDto(p));
  }

  private async calculateOwnerPayouts(tenantId: string, leaseId: string, competence: Date): Promise<void> {
    const [lease, expenses] = await Promise.all([
      this.prisma.lease.findUnique({
        where: { id: leaseId },
        include: { owners: true },
      }),
      this.prisma.rentalExpense.findMany({
        where: { leaseId, competence, isAuthorized: true },
      }),
    ]);

    if (!lease || !lease.owners.length) return;

    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const rentAmount = Number(lease.monthlyRent);

    // Calcular taxa administrativa
    const adminFeeAmount = rentAmount * (Number(lease.adminFeePercentage) / 100);
    const netAmount = rentAmount - adminFeeAmount - totalExpenses;

    // Criar repasse para cada proprietário
    for (const owner of lease.owners) {
      const ownerShare = netAmount * (Number(owner.percentage) / 100);

      await this.prisma.ownerPayout.create({
        data: {
          tenantId,
          leaseId,
          competence,
          ownerClientId: owner.clientId,
          rentAmount,
          adminFeeAmount,
          expensesAmount: totalExpenses,
          netAmount: ownerShare,
        },
      });
    }
  }

  private chargeToDto(charge: any): RentChargeDto {
    return {
      id: charge.id,
      leaseId: charge.leaseId,
      competence: charge.competence.toISOString().split("T")[0],
      dueDate: charge.dueDate.toISOString(),
      rentAmount: Number(charge.rentAmount),
      condoAmount: Number(charge.condoAmount),
      iptuAmount: Number(charge.iptuAmount),
      otherAmount: Number(charge.otherAmount),
      discountAmount: Number(charge.discountAmount),
      fineAmount: Number(charge.fineAmount),
      interestAmount: Number(charge.interestAmount),
      totalAmount: Number(charge.totalAmount),
      status: charge.status,
      createdAt: charge.createdAt.toISOString(),
      updatedAt: charge.updatedAt.toISOString(),
    };
  }

  private payoutToDto(payout: any): OwnerPayoutDto {
    return {
      id: payout.id,
      leaseId: payout.leaseId,
      competence: payout.competence.toISOString().split("T")[0],
      ownerClientId: payout.ownerClientId,
      rentAmount: Number(payout.rentAmount),
      adminFeeAmount: Number(payout.adminFeeAmount),
      expensesAmount: Number(payout.expensesAmount),
      netAmount: Number(payout.netAmount),
      payoutDate: payout.payoutDate?.toISOString() || null,
      payoutReceiptUrl: payout.payoutReceiptUrl,
      notes: payout.notes,
      createdAt: payout.createdAt.toISOString(),
    };
  }
}
