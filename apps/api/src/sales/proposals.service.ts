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

    const code = `SALE-${Date.now()}`;
    const commissionPercent = 5;
    const commissionValue = dto.finalSalePrice * (commissionPercent / 100);

    const sale = await this.prisma.$transaction(async (tx) => {
      // Atualizar proposta para APPROVED
      await tx.proposal.update({
        where: { id },
        data: { status: "APPROVED" },
      });

      // Criar venda
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
            create: [
              {
                tenantId: auth.tenantId,
                clientId: proposal.clientId,
              },
            ],
          },
        },
        include: {
          sellers: true,
          property: true,
          buyer: true,
        },
      });

      // Atualizar status do imóvel
      await tx.property.update({
        where: { id: proposal.propertyId },
        data: { status: "SOLD" },
      });

      // Criar comissão (5% default)
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
                percentage: 100,
                amount: commissionValue,
                status: "PENDING",
              },
            ],
          },
        },
      });

      // Registrar auditoria
      await tx.auditLog.create({
        data: {
          tenantId: auth.tenantId,
          userId: auth.userId,
          action: "SALE_CREATED",
          entity: "Sale",
          entityId: newSale.id,
          metadata: { code, finalSalePrice: dto.finalSalePrice },
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
