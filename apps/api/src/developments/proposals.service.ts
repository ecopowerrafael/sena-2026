import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import type { AuthContext } from "../auth/auth.types";
import type { LotProposalDto, LotSaleDto } from "@sena/shared";
import { ProposeLotDto, ApproveLotProposalDto } from "./developments.dto";

@Injectable()
export class LotProposalsService {
  constructor(private readonly prisma: PrismaService) {}

  async listByDevelopment(auth: AuthContext, developmentId: string): Promise<LotProposalDto[]> {
    const dev = await this.prisma.development.findUnique({
      where: { id: developmentId },
    });

    if (!dev || dev.tenantId !== auth.tenantId) {
      throw new NotFoundException("Empreendimento não encontrado");
    }

    const proposals = await this.prisma.lotProposal.findMany({
      where: { developmentId },
      orderBy: { proposedAt: "desc" },
    });

    return proposals.map((p) => this.toDto(p));
  }

  async findById(auth: AuthContext, id: string): Promise<LotProposalDto> {
    const proposal = await this.prisma.lotProposal.findUnique({ where: { id } });

    if (!proposal || proposal.tenantId !== auth.tenantId) {
      throw new NotFoundException("Proposta não encontrada");
    }

    return this.toDto(proposal);
  }

  async create(auth: AuthContext, dto: ProposeLotDto): Promise<LotProposalDto> {
    const dev = await this.prisma.development.findUnique({
      where: { id: dto.developmentId },
    });

    if (!dev || dev.tenantId !== auth.tenantId) {
      throw new NotFoundException("Empreendimento não encontrado");
    }

    const lot = await this.prisma.lot.findUnique({
      where: { id: dto.lotId },
    });

    if (!lot || lot.tenantId !== auth.tenantId) {
      throw new NotFoundException("Lote não encontrado");
    }

    const client = await this.prisma.client.findUnique({
      where: { id: dto.clientId },
    });

    if (!client || client.tenantId !== auth.tenantId) {
      throw new NotFoundException("Cliente não encontrado");
    }

    const proposal = await this.prisma.lotProposal.create({
      data: {
        tenantId: auth.tenantId,
        developmentId: dto.developmentId,
        lotId: dto.lotId,
        clientId: dto.clientId,
        brokerId: auth.userId,
        proposedPrice: dto.proposedPrice,
        entryAmount: dto.entryAmount,
        installments: dto.installments,
        interestRate: dto.interestRate,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        status: "DRAFT",
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        userId: auth.userId,
        action: "LOT_PROPOSAL_CREATED",
        entity: "LotProposal",
        entityId: proposal.id,
        metadata: { lotId: dto.lotId, proposedPrice: dto.proposedPrice },
      },
    });

    return this.toDto(proposal);
  }

  async approve(auth: AuthContext, id: string, dto: ApproveLotProposalDto): Promise<LotSaleDto> {
    const proposal = await this.findById(auth, id);

    if (proposal.status !== "ACCEPTED") {
      throw new BadRequestException("Apenas propostas aceitas podem ser aprovadas");
    }

    const lot = await this.prisma.lot.findUnique({ where: { id: proposal.lotId } });

    if (!lot) {
      throw new NotFoundException("Lote não encontrado");
    }

    // Transação atômica: aprovação → venda → atualiza status do lote
    const sale = await this.prisma.$transaction(async (tx) => {
      // Atualizar proposta
      await tx.lotProposal.update({
        where: { id },
        data: { status: "APPROVED", approvedAt: new Date() },
      });

      // Criar venda
      const newSale = await tx.lotSale.create({
        data: {
          tenantId: auth.tenantId,
          developmentId: proposal.developmentId,
          lotId: proposal.lotId,
          proposalId: id,
          clientId: proposal.clientId,
          brokerId: auth.userId,
          finalPrice: dto.finalPrice,
          entryAmount: proposal.entryAmount,
          installments: proposal.installments,
          interestRate: proposal.interestRate,
          contractNumber: dto.contractNumber,
          saleDate: new Date(),
        },
      });

      // Atualizar status do lote
      await tx.lot.update({
        where: { id: proposal.lotId },
        data: { status: "SOLD" },
      });

      // Registrar auditoria
      await tx.auditLog.create({
        data: {
          tenantId: auth.tenantId,
          userId: auth.userId,
          action: "LOT_SALE_CREATED",
          entity: "LotSale",
          entityId: newSale.id,
          metadata: { lotId: proposal.lotId, finalPrice: dto.finalPrice },
        },
      });

      return newSale;
    });

    return this.saleToDto(sale);
  }

  async listSales(auth: AuthContext, developmentId: string): Promise<LotSaleDto[]> {
    const dev = await this.prisma.development.findUnique({
      where: { id: developmentId },
    });

    if (!dev || dev.tenantId !== auth.tenantId) {
      throw new NotFoundException("Empreendimento não encontrado");
    }

    const sales = await this.prisma.lotSale.findMany({
      where: { developmentId },
      orderBy: { saleDate: "desc" },
    });

    return sales.map((s) => this.saleToDto(s));
  }

  private toDto(proposal: any): LotProposalDto {
    return {
      id: proposal.id,
      developmentId: proposal.developmentId,
      lotId: proposal.lotId,
      clientId: proposal.clientId,
      brokerId: proposal.brokerId,
      proposedPrice: Number(proposal.proposedPrice),
      entryAmount: Number(proposal.entryAmount),
      installments: proposal.installments,
      interestRate: proposal.interestRate ? Number(proposal.interestRate) : null,
      status: proposal.status,
      proposedAt: proposal.proposedAt.toISOString(),
      expiresAt: proposal.expiresAt?.toISOString() || null,
      approvedAt: proposal.approvedAt?.toISOString() || null,
      createdAt: proposal.createdAt.toISOString(),
      updatedAt: proposal.updatedAt.toISOString(),
    };
  }

  private saleToDto(sale: any): LotSaleDto {
    return {
      id: sale.id,
      developmentId: sale.developmentId,
      lotId: sale.lotId,
      proposalId: sale.proposalId,
      clientId: sale.clientId,
      brokerId: sale.brokerId,
      finalPrice: Number(sale.finalPrice),
      entryAmount: Number(sale.entryAmount),
      installments: sale.installments,
      interestRate: sale.interestRate ? Number(sale.interestRate) : null,
      contractNumber: sale.contractNumber,
      saleDate: sale.saleDate.toISOString(),
      createdAt: sale.createdAt.toISOString(),
      updatedAt: sale.updatedAt.toISOString(),
    };
  }
}
