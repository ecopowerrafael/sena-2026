import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { DEFAULT_LEAD_ORIGINS, type CampaignDto, type LeadOriginDto } from "@sena/shared";
import type { AuthContext } from "../auth/auth.types";
import { PrismaService } from "../database/prisma.service";
import type { CreateCampaignDto, CreateLeadOriginDto } from "./leads.dto";

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

@Injectable()
export class OriginsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Na primeira leitura o tenant recebe a lista padrão de origens. */
  async list(auth: AuthContext): Promise<LeadOriginDto[]> {
    const existing = await this.prisma.leadOrigin.findMany({
      where: { tenantId: auth.tenantId },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    if (existing.length > 0) {
      return existing.map((origin) => this.toDto(origin));
    }

    await this.prisma.leadOrigin.createMany({
      data: DEFAULT_LEAD_ORIGINS.map((name, index) => ({
        tenantId: auth.tenantId,
        name,
        slug: slugify(name),
        sortOrder: index,
      })),
    });

    const created = await this.prisma.leadOrigin.findMany({
      where: { tenantId: auth.tenantId },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return created.map((origin) => this.toDto(origin));
  }

  async create(auth: AuthContext, dto: CreateLeadOriginDto): Promise<LeadOriginDto> {
    const slug = slugify(dto.name);

    const duplicate = await this.prisma.leadOrigin.findFirst({
      where: { tenantId: auth.tenantId, slug },
    });

    if (duplicate) {
      throw new ConflictException("Já existe uma origem com este nome.");
    }

    const origin = await this.prisma.leadOrigin.create({
      data: { tenantId: auth.tenantId, name: dto.name.trim(), slug, sortOrder: 999 },
    });

    return this.toDto(origin);
  }

  async listCampaigns(auth: AuthContext): Promise<CampaignDto[]> {
    const campaigns = await this.prisma.campaign.findMany({
      where: { tenantId: auth.tenantId },
      orderBy: { name: "asc" },
    });

    return campaigns.map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      originId: campaign.originId,
      isActive: campaign.isActive,
    }));
  }

  async createCampaign(auth: AuthContext, dto: CreateCampaignDto): Promise<CampaignDto> {
    if (dto.originId) {
      const origin = await this.prisma.leadOrigin.findFirst({
        where: { id: dto.originId, tenantId: auth.tenantId },
      });

      if (!origin) {
        throw new BadRequestException("Origem inválida para esta imobiliária.");
      }
    }

    const duplicate = await this.prisma.campaign.findFirst({
      where: { tenantId: auth.tenantId, name: dto.name.trim() },
    });

    if (duplicate) {
      throw new ConflictException("Já existe uma campanha com este nome.");
    }

    const campaign = await this.prisma.campaign.create({
      data: {
        tenantId: auth.tenantId,
        name: dto.name.trim(),
        originId: dto.originId ?? null,
      },
    });

    return {
      id: campaign.id,
      name: campaign.name,
      originId: campaign.originId,
      isActive: campaign.isActive,
    };
  }

  private toDto(origin: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  }): LeadOriginDto {
    return { id: origin.id, name: origin.name, slug: origin.slug, isActive: origin.isActive };
  }
}
