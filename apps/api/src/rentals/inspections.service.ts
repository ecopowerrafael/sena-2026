import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import type { AuthContext } from "../auth/auth.types";
import type { InspectionDto } from "@sena/shared";
import { CreateInspectionDto } from "./rentals.dto";

@Injectable()
export class InspectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async listByLease(auth: AuthContext, leaseId: string): Promise<InspectionDto[]> {
    const lease = await this.prisma.lease.findUnique({ where: { id: leaseId } });

    if (!lease || lease.tenantId !== auth.tenantId) {
      throw new NotFoundException("Contrato não encontrado");
    }

    const inspections = await this.prisma.inspection.findMany({
      where: { leaseId },
      include: { items: true, media: true },
      orderBy: { inspectedAt: "desc" },
    });

    return inspections.map((i) => this.toDto(i));
  }

  async findById(auth: AuthContext, id: string): Promise<InspectionDto> {
    const inspection = await this.prisma.inspection.findUnique({
      where: { id },
      include: { items: true, media: true },
    });

    if (!inspection || inspection.tenantId !== auth.tenantId) {
      throw new NotFoundException("Vistoria não encontrada");
    }

    return this.toDto(inspection);
  }

  async create(auth: AuthContext, dto: CreateInspectionDto): Promise<InspectionDto> {
    const lease = await this.prisma.lease.findUnique({
      where: { id: dto.leaseId },
    });

    if (!lease || lease.tenantId !== auth.tenantId) {
      throw new NotFoundException("Contrato não encontrado");
    }

    const inspection = await this.prisma.inspection.create({
      data: {
        tenantId: auth.tenantId,
        leaseId: dto.leaseId,
        inspectionType: dto.inspectionType,
        inspectorName: dto.inspectorName,
        notes: dto.notes,
        inspectedAt: new Date(dto.inspectedAt),
        items: dto.items
          ? {
              createMany: {
                data: dto.items.map((item) => ({
                  tenantId: auth.tenantId,
                  description: item.description,
                  status: item.status || "OK",
                  notes: item.notes,
                })),
              },
            }
          : undefined,
      },
      include: { items: true, media: true },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        userId: auth.userId,
        action: "INSPECTION_CREATED",
        entity: "Inspection",
        entityId: inspection.id,
        metadata: { leaseId: dto.leaseId, type: dto.inspectionType },
      },
    });

    return this.toDto(inspection);
  }

  private toDto(inspection: any): InspectionDto {
    return {
      id: inspection.id,
      leaseId: inspection.leaseId,
      inspectionType: inspection.inspectionType,
      inspectorName: inspection.inspectorName,
      notes: inspection.notes,
      inspectedAt: inspection.inspectedAt.toISOString(),
      items: inspection.items.map((item: any) => ({
        id: item.id,
        inspectionId: item.inspectionId,
        description: item.description,
        status: item.status,
        notes: item.notes,
        createdAt: item.createdAt.toISOString(),
      })),
      media: inspection.media.map((m: any) => ({
        id: m.id,
        inspectionId: m.inspectionId,
        url: m.url,
        mimeType: m.mimeType,
        uploadedAt: m.uploadedAt.toISOString(),
      })),
      createdAt: inspection.createdAt.toISOString(),
    };
  }
}
