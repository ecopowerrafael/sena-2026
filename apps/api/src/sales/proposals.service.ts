import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import type { AuthContext } from "../auth/auth.types";
import type { ProposalDto, SaleDto } from "@sena/shared";
import { CreateProposalDto, UpdateProposalDto, ApproveProposalDto } from "./sales.dto";

@Injectable()
export class ProposalsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(auth: AuthContext): Promise<ProposalDto[]> {
    const proposals = await this.prisma.proposal.findMany({
      where: { tenantId: auth.tenantId },
      include: { property: true, client: true, broker: true },
      orderBy: { createdAt: "desc" },
    });

    return proposals.map((p) => this.toDto(p));
  }

  async findById(auth: AuthContext, id: string): Promise<ProposalDto> {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id },
      include: { property: true, client: true, broker: true },
    });

    if (!proposal || proposal.tenantId !== auth.tenantId) {
      throw new NotFoundException("Proposta não encontrada");
    }

    return this.toDto(proposal);
  }

  async create(auth: AuthContext, dto: CreateProposalDto): Promise<ProposalDto> {
    const client = await this.prisma.client.findUnique({
      where: { id: dto.clientId },
    });

    if (!client || client.tenantId !== auth.tenantId) {
      throw new NotFoundException("Cliente não encontrado");
    }

    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });

    if (!property || property.tenantId !== auth.tenantId) {
      throw new NotFoundException("Imóvel não encontrado");
    }

    const code = `PROP-${Date.now()}`;

    const proposal = await this.prisma.proposal.create({
      data: {
        tenantId: auth.tenantId,
        code,
        propertyId: dto.propertyId,
        clientId: dto.clientId,
        brokerId: auth.userId,
        advertisedPrice: dto.advertisedPrice,
        proposedPrice: dto.proposedPrice,
        downPayment: dto.downPayment,
        installmentsCount: dto.installmentsCount,
        installmentsValue: dto.installmentsValue,
        paymentMethod: dto.paymentMethod,
        paymentDescription: dto.paymentDescription,
        status: "DRAFT",
      },
      include: { property: true, client: true, broker: true },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        userId: auth.userId,
        action: "PROPOSAL_CREATED",
        entity: "Proposal",
        entityId: proposal.id,
        metadata: { code, proposedPrice: dto.proposedPrice },
      },
    });

    return this.toDto(proposal);
  }

  async update(auth: AuthContext, id: string, dto: UpdateProposalDto): Promise<ProposalDto> {
    const proposal = await this.findById(auth, id);

    if (proposal.status !== "DRAFT" && proposal.status !== "REJECTED") {
      throw new BadRequestException(
        "Apenas propostas em rascunho ou rejeitadas podem ser editadas"
      );
    }

    const data: any = {};
    if (dto.proposedPrice !== undefined) data.proposedPrice = dto.proposedPrice;
    if (dto.downPayment !== undefined) data.downPayment = dto.downPayment;
    if (dto.counterProposalNotes !== undefined)
      data.counterProposalNotes = dto.counterProposalNotes;
    if (dto.status !== undefined) data.status = dto.status;

    const updated = await this.prisma.proposal.update({
      where: { id },
      data,
      include: { property: true, client: true, broker: true },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        userId: auth.userId,
        action: "PROPOSAL_UPDATED",
        entity: "Proposal",
        entityId: id,
        metadata: { status: dto.status },
      },
    });

    return this.toDto(updated);
  }

  async approve(auth: AuthContext, id: string, dto: ApproveProposalDto): Promise<SaleDto> {
    const proposal = await this.findById(auth, id);

    if (proposal.status !== "SUBMITTED" && proposal.status !== "COUNTER_PROPOSED") {
      throw new BadRequestException(
        "Apenas propostas submetidas ou contraproposta podem ser aprovadas"
      );
    }

    // Fetch property owners (REAL sellers)
    const propertyOwners = await this.prisma.propertyOwner.findMany({
      where: {
        propertyId: proposal.propertyId,
        tenantId: auth.tenantId,
      },
    });

    if (propertyOwners.length === 0) {
      throw new BadRequestException(
        "Imóvel não possui proprietários cadastrados"
      );
    }

    const code = `SALE-${Date.now()}`;
    const commissionPercent = 6; // Official rate
    const commissionValue = dto.finalSalePrice * (commissionPercent / 100);

    const sale = await this.prisma.$transaction(async (tx) => {
      // Update proposal to APPROVED
      await tx.proposal.update({
        where: { id },
        data: { status: "APPROVED" },
      });

      // Create sale with real sellers (property owners, not buyer)
      const newSale = await tx.sale.create({
        data: {
          tenantId: auth.tenantId,
          code,
          proposalId: id,
          propertyId: proposal.propertyId,
          buyerClientId: proposal.clientId,
          brokerId: auth.userId,
          finalSalePrice: dto.finalSalePrice,
          saleDate: new Date(dto.saleDate),
          paymentType: dto.paymentType,
          contractNumber: dto.contractNumber,
          documentationStatus: "IN_INVENTORY",
          status: "PENDING",
          sellers: {
            create: propertyOwners.map((owner) => ({
              tenantId: auth.tenantId,
              clientId: owner.clientId,
              percentage: owner.ownershipPercentage,
            })),
          },
        },
        include: {
          sellers: true,
          property: true,
          buyer: true,
        },
      });

      // Update property status to SOLD
      await tx.property.update({
        where: { id: proposal.propertyId },
        data: { status: "SOLD" },
      });

      // Create commission (6% official rate with standard splits)
      // Splits: 40% AGENCY, 10% MANAGER, 25% CAPTATOR, 25% ATTENDANCE
      await tx.commission.create({
        data: {
          tenantId: auth.tenantId,
          saleId: newSale.id,
          baseValue: dto.finalSalePrice,
          totalPercentage: commissionPercent,
          totalValue: commissionValue,
          status: "EXPECTED",
          expectedAt: new Date(),
          splits: {
            create: [
              {
                tenantId: auth.tenantId,
                recipientType: "AGENCY",
                recipientId: auth.userId,
                percentage: 40,
                amount: commissionValue * 0.4,
                status: "PENDING",
              },
              {
                tenantId: auth.tenantId,
                recipientType: "MANAGER",
                recipientId: auth.userId,
                percentage: 10,
                amount: commissionValue * 0.1,
                status: "PENDING",
              },
              {
                tenantId: auth.tenantId,
                recipientType: "CAPTATOR",
                recipientId: auth.userId,
                percentage: 25,
                amount: commissionValue * 0.25,
                status: "PENDING",
              },
              {
                tenantId: auth.tenantId,
                recipientType: "ATTENDANT_BROKER",
                recipientId: auth.userId,
                percentage: 25,
                amount: commissionValue * 0.25,
                status: "PENDING",
              },
            ],
          },
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          tenantId: auth.tenantId,
          userId: auth.userId,
          action: "SALE_CREATED",
          entity: "Sale",
          entityId: newSale.id,
          metadata: {
            code,
            finalSalePrice: dto.finalSalePrice,
            sellers: propertyOwners.length,
            commission: commissionPercent,
          },
        },
      });

      return newSale;
    });

    return this.saleToDtoBasic(sale);
  }

  private toDto(proposal: any): ProposalDto {
    return {
      id: proposal.id,
      code: proposal.code,
      propertyId: proposal.propertyId,
      clientId: proposal.clientId,
      brokerId: proposal.brokerId,
      advertisedPrice: Number(proposal.advertisedPrice),
      proposedPrice: Number(proposal.proposedPrice),
      downPayment: proposal.downPayment ? Number(proposal.downPayment) : null,
      installmentsCount: proposal.installmentsCount,
      installmentsValue: proposal.installmentsValue ? Number(proposal.installmentsValue) : null,
      paymentMethod: proposal.paymentMethod,
      paymentDescription: proposal.paymentDescription,
      counterProposalPrice: proposal.counterProposalPrice
        ? Number(proposal.counterProposalPrice)
        : null,
      counterProposalNotes: proposal.counterProposalNotes,
      status: proposal.status,
      createdAt: proposal.createdAt.toISOString(),
      updatedAt: proposal.updatedAt.toISOString(),
    };
  }

  private saleToDtoBasic(sale: any): SaleDto {
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
