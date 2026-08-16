import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import type { AuthContext } from "../auth/auth.types";
import type { DevelopmentDto, DevelopmentBlockDto } from "@sena/shared";
import { CreateDevelopmentDto, CreateBlockDto } from "./developments.dto";

@Injectable()
export class DevelopmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(auth: AuthContext): Promise<DevelopmentDto[]> {
    const developments = await this.prisma.development.findMany({
      where: { tenantId: auth.tenantId },
      orderBy: { launchDate: "desc" },
    });

    return developments.map((d) => this.toDto(d));
  }

  async findById(auth: AuthContext, id: string): Promise<DevelopmentDto> {
    const dev = await this.prisma.development.findUnique({ where: { id } });

    if (!dev || dev.tenantId !== auth.tenantId) {
      throw new NotFoundException("Empreendimento não encontrado");
    }

    return this.toDto(dev);
  }

  async create(auth: AuthContext, dto: CreateDevelopmentDto): Promise<DevelopmentDto> {
    const dev = await this.prisma.development.create({
      data: {
        tenantId: auth.tenantId,
        name: dto.name,
        developerCompany: dto.developerCompany,
        location: dto.location,
        launchDate: new Date(dto.launchDate),
        deliveryForecast: dto.deliveryForecast ? new Date(dto.deliveryForecast) : null,
        commissionPercentage: dto.commissionPercentage,
        campaignId: dto.campaignId,
        status: dto.status || "ACTIVE",
        heroAssetId: dto.heroAssetId,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        userId: auth.userId,
        action: "DEVELOPMENT_CREATED",
        entity: "Development",
        entityId: dev.id,
        metadata: { name: dto.name },
      },
    });

    return this.toDto(dev);
  }

  async listBlocks(auth: AuthContext, developmentId: string): Promise<DevelopmentBlockDto[]> {
    const dev = await this.prisma.development.findUnique({
      where: { id: developmentId },
    });

    if (!dev || dev.tenantId !== auth.tenantId) {
      throw new NotFoundException("Empreendimento não encontrado");
    }

    const blocks = await this.prisma.developmentBlock.findMany({
      where: { developmentId },
      orderBy: { sortOrder: "asc" },
    });

    return blocks.map((b) => this.blockToDto(b));
  }

  async createBlock(auth: AuthContext, dto: CreateBlockDto): Promise<DevelopmentBlockDto> {
    const dev = await this.prisma.development.findUnique({
      where: { id: dto.developmentId },
    });

    if (!dev || dev.tenantId !== auth.tenantId) {
      throw new NotFoundException("Empreendimento não encontrado");
    }

    const block = await this.prisma.developmentBlock.create({
      data: {
        tenantId: auth.tenantId,
        developmentId: dto.developmentId,
        code: dto.code,
        name: dto.name,
        sortOrder: dto.sortOrder || 0,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        userId: auth.userId,
        action: "BLOCK_CREATED",
        entity: "DevelopmentBlock",
        entityId: block.id,
        metadata: { developmentId: dto.developmentId, code: dto.code },
      },
    });

    return this.blockToDto(block);
  }

  private toDto(dev: any): DevelopmentDto {
    return {
      id: dev.id,
      name: dev.name,
      developerCompany: dev.developerCompany,
      location: dev.location,
      launchDate: dev.launchDate.toISOString(),
      deliveryForecast: dev.deliveryForecast?.toISOString() || null,
      commissionPercentage: Number(dev.commissionPercentage),
      campaignId: dev.campaignId,
      status: dev.status,
      heroAssetId: dev.heroAssetId,
      createdAt: dev.createdAt.toISOString(),
      updatedAt: dev.updatedAt.toISOString(),
    };
  }

  private blockToDto(block: any): DevelopmentBlockDto {
    return {
      id: block.id,
      developmentId: block.developmentId,
      code: block.code,
      name: block.name,
      sortOrder: block.sortOrder,
      createdAt: block.createdAt.toISOString(),
    };
  }
}
