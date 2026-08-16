import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import type { AuthContext } from "../auth/auth.types";
import type { VisitDto } from "@sena/shared";
import { CreateVisitDto, UpdateVisitDto } from "./sales.dto";

@Injectable()
export class VisitsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(auth: AuthContext): Promise<VisitDto[]> {
    const visits = await this.prisma.visit.findMany({
      where: { tenantId: auth.tenantId },
      include: { property: true, client: true, broker: true },
      orderBy: { scheduledAt: "desc" },
    });

    return visits.map((v) => this.toDto(v));
  }

  async findById(auth: AuthContext, id: string): Promise<VisitDto> {
    const visit = await this.prisma.visit.findUnique({
      where: { id },
      include: { property: true, client: true, broker: true },
    });

    if (!visit || visit.tenantId !== auth.tenantId) {
      throw new NotFoundException("Visita não encontrada");
    }

    return this.toDto(visit);
  }

  async create(auth: AuthContext, dto: CreateVisitDto): Promise<VisitDto> {
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

    const visit = await this.prisma.visit.create({
      data: {
        tenantId: auth.tenantId,
        propertyId: dto.propertyId,
        clientId: dto.clientId,
        brokerId: auth.userId,
        scheduledAt: new Date(dto.scheduledAt),
        durationMinutes: dto.durationMinutes,
        status: "SCHEDULED",
      },
      include: { property: true, client: true, broker: true },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        userId: auth.userId,
        action: "VISIT_SCHEDULED",
        entity: "Visit",
        entityId: visit.id,
        metadata: { scheduledAt: dto.scheduledAt },
      },
    });

    return this.toDto(visit);
  }

  async update(auth: AuthContext, id: string, dto: UpdateVisitDto): Promise<VisitDto> {
    await this.findById(auth, id);

    const data: any = {};
    if (dto.scheduledAt !== undefined) data.scheduledAt = new Date(dto.scheduledAt);
    if (dto.durationMinutes !== undefined) data.durationMinutes = dto.durationMinutes;
    if (dto.feedback !== undefined) data.feedback = dto.feedback;
    if (dto.impression !== undefined) data.impression = dto.impression;
    if (dto.status !== undefined) data.status = dto.status;

    const visit = await this.prisma.visit.update({
      where: { id },
      data,
      include: { property: true, client: true, broker: true },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        userId: auth.userId,
        action: "VISIT_UPDATED",
        entity: "Visit",
        entityId: id,
        metadata: { status: dto.status },
      },
    });

    return this.toDto(visit);
  }

  private toDto(visit: any): VisitDto {
    return {
      id: visit.id,
      propertyId: visit.propertyId,
      clientId: visit.clientId,
      brokerId: visit.brokerId,
      scheduledAt: visit.scheduledAt.toISOString(),
      durationMinutes: visit.durationMinutes,
      feedback: visit.feedback,
      impression: visit.impression,
      status: visit.status,
      createdAt: visit.createdAt.toISOString(),
    };
  }
}
