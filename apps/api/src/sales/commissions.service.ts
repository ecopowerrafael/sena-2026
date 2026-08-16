import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import type { AuthContext } from "../auth/auth.types";
import type { CommissionDto } from "@sena/shared";

@Injectable()
export class CommissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(auth: AuthContext): Promise<CommissionDto[]> {
    const commissions = await this.prisma.commission.findMany({
      where: { tenantId: auth.tenantId },
      include: { splits: true, sale: true },
      orderBy: { createdAt: "desc" },
    });

    return commissions.map((c) => this.toDto(c));
  }

  async findById(auth: AuthContext, id: string): Promise<CommissionDto> {
    const commission = await this.prisma.commission.findUnique({
      where: { id },
      include: { splits: true, sale: true },
    });

    if (!commission || commission.tenantId !== auth.tenantId) {
      throw new NotFoundException("Comissão não encontrada");
    }

    return this.toDto(commission);
  }

  async getBySaleId(auth: AuthContext, saleId: string): Promise<CommissionDto | null> {
    const commission = await this.prisma.commission.findFirst({
      where: { tenantId: auth.tenantId, saleId },
      include: { splits: true, sale: true },
    });

    return commission ? this.toDto(commission) : null;
  }

  private toDto(commission: any): CommissionDto {
    return {
      id: commission.id,
      saleId: commission.saleId,
      baseValue: Number(commission.baseValue),
      totalPercentage: Number(commission.totalPercentage),
      totalValue: Number(commission.totalValue),
      status: commission.status,
      expectedAt: commission.expectedAt?.toISOString() || null,
      receivedAt: commission.receivedAt?.toISOString() || null,
      settledAt: commission.settledAt?.toISOString() || null,
      splits: commission.splits.map((s: any) => ({
        id: s.id,
        commissionId: s.commissionId,
        recipientType: s.recipientType,
        recipientId: s.recipientId,
        recipientName: s.recipientName,
        percentage: s.percentage,
        amount: Number(s.amount),
        status: s.status,
        paidAt: s.paidAt?.toISOString() || null,
      })),
      createdAt: commission.createdAt.toISOString(),
    };
  }
}
