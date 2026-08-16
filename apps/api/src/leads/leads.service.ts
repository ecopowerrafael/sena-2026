import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
  canTransition,
  type ActivityDto,
  type ApiListMeta,
  type ClientDto,
  type LeadDto,
  type LeadStatusHistoryDto,
  type LeadStatusValue,
} from "@sena/shared";
import { AuditService } from "../audit/audit.service";
import type { AuthContext } from "../auth/auth.types";
import { ClientsService } from "../clients/clients.service";
import { maskDocument } from "../common/documents";
import { ownerScope } from "../common/scope";
import { PrismaService } from "../database/prisma.service";
import type {
  ChangeLeadStatusDto,
  CreateActivityDto,
  CreateLeadDto,
  ListLeadsQueryDto,
  UpdateLeadDto,
} from "./leads.dto";

const LEAD_INCLUDE = {
  client: { include: { roles: true, responsibleBroker: { select: { name: true } } } },
  assignedBroker: { select: { name: true } },
  origin: { select: { name: true } },
  campaign: { select: { name: true } },
} as const;

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clients: ClientsService,
    private readonly audit: AuditService
  ) {}

  async list(
    auth: AuthContext,
    query: ListLeadsQueryDto
  ): Promise<{ data: LeadDto[]; meta: ApiListMeta }> {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 100, 200);

    const where = {
      tenantId: auth.tenantId,
      deletedAt: null,
      ...ownerScope(auth, "assignedBrokerId"),
      ...(query.assignedBrokerId ? { assignedBrokerId: query.assignedBrokerId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.originId ? { originId: query.originId } : {}),
      ...(query.search
        ? {
            client: {
              OR: [
                { name: { contains: query.search } },
                { email: { contains: query.search } },
                { phone: { contains: query.search } },
              ],
            },
          }
        : {}),
    };

    const [total, leads] = await Promise.all([
      this.prisma.lead.count({ where: where as never }),
      this.prisma.lead.findMany({
        where: where as never,
        include: LEAD_INCLUDE,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      data: leads.map((lead) => this.toDto(lead as never)),
      meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
    };
  }

  async findById(auth: AuthContext, id: string): Promise<LeadDto> {
    const lead = await this.requireLead(auth, id);

    return this.toDto(lead as never);
  }

  async create(auth: AuthContext, dto: CreateLeadDto): Promise<LeadDto> {
    if (!dto.clientId && !dto.client) {
      throw new BadRequestException("Informe um cliente existente ou os dados de um novo cliente.");
    }

    const origin = await this.prisma.leadOrigin.findFirst({
      where: { id: dto.originId, tenantId: auth.tenantId },
    });

    if (!origin) {
      throw new BadRequestException("Origem inválida para esta imobiliária.");
    }

    if (dto.campaignId) {
      const campaign = await this.prisma.campaign.findFirst({
        where: { id: dto.campaignId, tenantId: auth.tenantId },
      });

      if (!campaign) {
        throw new BadRequestException("Campanha inválida para esta imobiliária.");
      }
    }

    const assignedBrokerId = await this.resolveBroker(auth, dto.assignedBrokerId);
    const clientId = dto.clientId
      ? (await this.clients.findById(auth, dto.clientId)).id
      : (
          await this.clients.create(auth, {
            ...dto.client!,
            responsibleBrokerId: assignedBrokerId,
          })
        ).id;

    const lead = await this.prisma.lead.create({
      data: {
        tenantId: auth.tenantId,
        clientId,
        assignedBrokerId,
        originId: origin.id,
        campaignId: dto.campaignId ?? null,
        estimatedBudget: dto.estimatedBudget ?? null,
        nextContactAt: dto.nextContactAt ? new Date(dto.nextContactAt) : null,
        notes: dto.notes ?? null,
        statusHistory: {
          create: {
            tenantId: auth.tenantId,
            toStatus: "NEW",
            changedByUserId: auth.userId,
          },
        },
      },
      include: LEAD_INCLUDE,
    });

    await this.audit.record({
      action: "lead.created",
      tenantId: auth.tenantId,
      userId: auth.userId,
      entity: "Lead",
      entityId: lead.id,
    });

    return this.toDto(lead as never);
  }

  async update(auth: AuthContext, id: string, dto: UpdateLeadDto): Promise<LeadDto> {
    const current = await this.requireLead(auth, id);

    if (dto.originId) {
      const origin = await this.prisma.leadOrigin.findFirst({
        where: { id: dto.originId, tenantId: auth.tenantId },
      });

      if (!origin) {
        throw new BadRequestException("Origem inválida para esta imobiliária.");
      }
    }

    const assignedBrokerId = dto.assignedBrokerId
      ? await this.resolveBroker(auth, dto.assignedBrokerId)
      : undefined;

    const lead = await this.prisma.lead.update({
      where: { id: current.id },
      data: {
        ...(dto.originId ? { originId: dto.originId } : {}),
        ...(dto.campaignId !== undefined ? { campaignId: dto.campaignId || null } : {}),
        ...(assignedBrokerId ? { assignedBrokerId } : {}),
        ...(dto.estimatedBudget !== undefined ? { estimatedBudget: dto.estimatedBudget } : {}),
        ...(dto.lastContactAt !== undefined
          ? { lastContactAt: dto.lastContactAt ? new Date(dto.lastContactAt) : null }
          : {}),
        ...(dto.nextContactAt !== undefined
          ? { nextContactAt: dto.nextContactAt ? new Date(dto.nextContactAt) : null }
          : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      },
      include: LEAD_INCLUDE,
    });

    return this.toDto(lead as never);
  }

  /**
   * Move o lead no funil. A transição precisa ser permitida, LOST exige motivo
   * e toda mudança grava histórico (ARCHITECTURE.md §11).
   */
  async changeStatus(auth: AuthContext, id: string, dto: ChangeLeadStatusDto): Promise<LeadDto> {
    const current = await this.requireLead(auth, id);
    const from = current.status as LeadStatusValue;
    const to = dto.status;

    if (from === to) {
      throw new BadRequestException("O lead já está neste estágio.");
    }

    if (!canTransition(from, to)) {
      throw new BadRequestException(`Transição inválida no funil: ${from} → ${to}.`);
    }

    if (to === "LOST" && !dto.reason?.trim()) {
      throw new BadRequestException("Informe o motivo da perda.");
    }

    const [lead] = await this.prisma.$transaction([
      this.prisma.lead.update({
        where: { id: current.id },
        data: {
          status: to,
          lostReason: to === "LOST" ? dto.reason!.trim() : null,
          lastContactAt: new Date(),
        },
        include: LEAD_INCLUDE,
      }),
      this.prisma.leadStatusHistory.create({
        data: {
          tenantId: auth.tenantId,
          leadId: current.id,
          fromStatus: from,
          toStatus: to,
          reason: dto.reason?.trim() ?? null,
          changedByUserId: auth.userId,
        },
      }),
    ]);

    await this.audit.record({
      action: "lead.status_changed",
      tenantId: auth.tenantId,
      userId: auth.userId,
      entity: "Lead",
      entityId: current.id,
      metadata: { from, to },
    });

    return this.toDto(lead as never);
  }

  async history(auth: AuthContext, id: string): Promise<LeadStatusHistoryDto[]> {
    await this.requireLead(auth, id);

    const history = await this.prisma.leadStatusHistory.findMany({
      where: { leadId: id, tenantId: auth.tenantId },
      include: { changedBy: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    });

    return history.map((entry) => ({
      id: entry.id,
      fromStatus: entry.fromStatus as LeadStatusValue | null,
      toStatus: entry.toStatus as LeadStatusValue,
      reason: entry.reason,
      changedByName: entry.changedBy?.name ?? null,
      createdAt: entry.createdAt.toISOString(),
    }));
  }

  async addActivity(auth: AuthContext, id: string, dto: CreateActivityDto): Promise<ActivityDto> {
    const lead = await this.requireLead(auth, id);
    const occurredAt = dto.occurredAt ? new Date(dto.occurredAt) : new Date();

    const [activity] = await this.prisma.$transaction([
      this.prisma.activity.create({
        data: {
          tenantId: auth.tenantId,
          leadId: lead.id,
          clientId: lead.clientId,
          type: dto.type,
          description: dto.description.trim(),
          occurredAt,
          createdByUserId: auth.userId,
        },
        include: { createdBy: { select: { name: true } } },
      }),
      this.prisma.lead.update({
        where: { id: lead.id },
        data: { lastContactAt: occurredAt },
      }),
    ]);

    return {
      id: activity.id,
      type: activity.type as ActivityDto["type"],
      description: activity.description,
      occurredAt: activity.occurredAt.toISOString(),
      clientId: activity.clientId,
      leadId: activity.leadId,
      createdByName: activity.createdBy?.name ?? null,
    };
  }

  async listActivities(auth: AuthContext, id: string): Promise<ActivityDto[]> {
    await this.requireLead(auth, id);

    const activities = await this.prisma.activity.findMany({
      where: { leadId: id, tenantId: auth.tenantId },
      include: { createdBy: { select: { name: true } } },
      orderBy: { occurredAt: "desc" },
    });

    return activities.map((activity) => ({
      id: activity.id,
      type: activity.type as ActivityDto["type"],
      description: activity.description,
      occurredAt: activity.occurredAt.toISOString(),
      clientId: activity.clientId,
      leadId: activity.leadId,
      createdByName: activity.createdBy?.name ?? null,
    }));
  }

  private async requireLead(auth: AuthContext, id: string) {
    const lead = await this.prisma.lead.findFirst({
      where: {
        id,
        tenantId: auth.tenantId,
        deletedAt: null,
        ...ownerScope(auth, "assignedBrokerId"),
      },
      include: LEAD_INCLUDE,
    });

    if (!lead) {
      throw new NotFoundException("Lead não encontrado.");
    }

    return lead;
  }

  /** Corretor só atribui lead a si mesmo; gerente/admin distribuem para a equipe. */
  private async resolveBroker(auth: AuthContext, brokerId?: string): Promise<string> {
    if (!brokerId || brokerId === auth.userId) {
      return auth.userId;
    }

    if (auth.role === "BROKER") {
      throw new BadRequestException("Corretor só pode assumir leads próprios.");
    }

    const broker = await this.prisma.user.findFirst({
      where: { id: brokerId, tenantId: auth.tenantId, deletedAt: null, status: "ACTIVE" },
    });

    if (!broker) {
      throw new BadRequestException("Corretor responsável inválido.");
    }

    return broker.id;
  }

  private toDto(lead: {
    id: string;
    status: string;
    lostReason: string | null;
    estimatedBudget: unknown;
    originId: string;
    campaignId: string | null;
    assignedBrokerId: string;
    lastContactAt: Date | null;
    nextContactAt: Date | null;
    notes: string | null;
    createdAt: Date;
    origin: { name: string };
    campaign: { name: string } | null;
    assignedBroker: { name: string };
    client: {
      id: string;
      type: string;
      name: string;
      documentType: string | null;
      documentLast4: string | null;
      phone: string | null;
      whatsapp: string | null;
      email: string | null;
      responsibleBrokerId: string | null;
      responsibleBroker: { name: string } | null;
      lastContactAt: Date | null;
      nextContactAt: Date | null;
      notes: string | null;
      createdAt: Date;
      roles: { role: string }[];
    };
  }): LeadDto {
    const client: ClientDto = {
      id: lead.client.id,
      type: lead.client.type as ClientDto["type"],
      name: lead.client.name,
      documentType: lead.client.documentType as ClientDto["documentType"],
      documentMasked: maskDocument(
        lead.client.documentType as "CPF" | "CNPJ" | null,
        lead.client.documentLast4
      ),
      phone: lead.client.phone,
      whatsapp: lead.client.whatsapp,
      email: lead.client.email,
      roles: lead.client.roles.map((assignment) => assignment.role as ClientDto["roles"][number]),
      responsibleBrokerId: lead.client.responsibleBrokerId,
      responsibleBrokerName: lead.client.responsibleBroker?.name ?? null,
      lastContactAt: lead.client.lastContactAt?.toISOString() ?? null,
      nextContactAt: lead.client.nextContactAt?.toISOString() ?? null,
      notes: lead.client.notes,
      createdAt: lead.client.createdAt.toISOString(),
    };

    return {
      id: lead.id,
      status: lead.status as LeadStatusValue,
      lostReason: lead.lostReason,
      estimatedBudget: lead.estimatedBudget === null ? null : Number(lead.estimatedBudget),
      originId: lead.originId,
      originName: lead.origin.name,
      campaignId: lead.campaignId,
      campaignName: lead.campaign?.name ?? null,
      assignedBrokerId: lead.assignedBrokerId,
      assignedBrokerName: lead.assignedBroker.name,
      client,
      lastContactAt: lead.lastContactAt?.toISOString() ?? null,
      nextContactAt: lead.nextContactAt?.toISOString() ?? null,
      notes: lead.notes,
      createdAt: lead.createdAt.toISOString(),
    };
  }
}
