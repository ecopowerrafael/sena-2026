import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import type { AuthContext } from "../auth/auth.types";
import type { SaleDto } from "@sena/shared";
import { UpdateSaleDto } from "./sales.dto";

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(auth: AuthContext): Promise<SaleDto[]> {
    const sales = await this.prisma.sale.findMany({
      where: { tenantId: auth.tenantId },
      include: { sellers: true, property: true, buyer: true },
      orderBy: { createdAt: "desc" },
    });

    return sales.map((s) => this.toDto(s));
  }

  async findById(auth: AuthContext, id: string): Promise<SaleDto> {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: { sellers: true, property: true, buyer: true },
    });

    if (!sale || sale.tenantId !== auth.tenantId) {
      throw new NotFoundException("Venda não encontrada");
    }

    return this.toDto(sale);
  }

  async update(auth: AuthContext, id: string, dto: UpdateSaleDto): Promise<SaleDto> {
    await this.findById(auth, id);

    const data: any = {};
    if (dto.paymentType !== undefined) data.paymentType = dto.paymentType;
    if (dto.contractNumber !== undefined) data.contractNumber = dto.contractNumber;
    if (dto.documentationStatus !== undefined) data.documentationStatus = dto.documentationStatus;
    if (dto.status !== undefined) data.status = dto.status;

    const sale = await this.prisma.sale.update({
      where: { id },
      data,
      include: { sellers: true, property: true, buyer: true },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        userId: auth.userId,
        action: "SALE_UPDATED",
        entity: "Sale",
        entityId: id,
        metadata: { status: dto.status, documentationStatus: dto.documentationStatus },
      },
    });

    return this.toDto(sale);
  }

  private toDto(sale: any): SaleDto {
    return {
      id: sale.id,
      code: sale.code,
      propertyId: sale.propertyId,
      buyerClientId: sale.buyerClientId,
      brokerId: sale.brokerId,
      captatorBrokerId: sale.captatorBrokerId,
      proposalId: sale.proposalId,
      finalSalePrice: Number(sale.finalSalePrice),
      saleDate: sale.saleDate.toISOString(),
      paymentType: sale.paymentType,
      contractNumber: sale.contractNumber,
      documentationStatus: sale.documentationStatus,
      status: sale.status,
      createdAt: sale.createdAt.toISOString(),
      updatedAt: sale.updatedAt.toISOString(),
    };
  }
}
