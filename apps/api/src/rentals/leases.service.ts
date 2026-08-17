import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import type { AuthContext } from "../auth/auth.types";
import type { LeaseDto } from "@sena/shared";
import { CreateLeaseDto, UpdateLeaseDto, AddLeaseTenantDto, AddLeaseOwnerDto } from "./rentals.dto";

@Injectable()
export class LeasesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(auth: AuthContext): Promise<LeaseDto[]> {
    const leases = await this.prisma.lease.findMany({
      where: { tenantId: auth.tenantId },
      include: { property: true, responsibleBroker: true },
      orderBy: { createdAt: "desc" },
    });

    return leases.map((l) => this.toDto(l));
  }

  async findById(auth: AuthContext, id: string): Promise<LeaseDto> {
    const lease = await this.prisma.lease.findUnique({
      where: { id },
      include: { property: true, responsibleBroker: true },
    });

    if (!lease || lease.tenantId !== auth.tenantId) {
      throw new NotFoundException("Contrato de locação não encontrado");
    }

    return this.toDto(lease);
  }

  async create(auth: AuthContext, dto: CreateLeaseDto): Promise<LeaseDto> {
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });

    if (!property || property.tenantId !== auth.tenantId) {
      throw new NotFoundException("Imóvel não encontrado");
    }

    if (dto.responsibleBrokerId) {
      const broker = await this.prisma.user.findUnique({
        where: { id: dto.responsibleBrokerId },
      });

      if (!broker || broker.tenantId !== auth.tenantId) {
        throw new NotFoundException("Corretor não encontrado");
      }
    }

    const lease = await this.prisma.lease.create({
      data: {
        tenantId: auth.tenantId,
        contractNumber: dto.contractNumber,
        propertyId: dto.propertyId,
        responsibleBrokerId: dto.responsibleBrokerId,
        monthlyRent: dto.monthlyRent,
        condoFee: dto.condoFee,
        iptuFee: dto.iptuFee,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        dueDay: dto.dueDay,
        guaranteeType: dto.guaranteeType,
        adminFeePercentage: dto.adminFeePercentage,
        adjustmentIndex: dto.adjustmentIndex,
        nextAdjustmentDate: dto.nextAdjustmentDate ? new Date(dto.nextAdjustmentDate) : null,
        status: "ACTIVE",
      },
      include: { property: true, responsibleBroker: true },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        userId: auth.userId,
        action: "LEASE_CREATED",
        entity: "Lease",
        entityId: lease.id,
        metadata: { contractNumber: dto.contractNumber },
      },
    });

    return this.toDto(lease);
  }

  async update(auth: AuthContext, id: string, dto: UpdateLeaseDto): Promise<LeaseDto> {
    await this.findById(auth, id);

    const data: any = {};
    if (dto.contractNumber !== undefined) data.contractNumber = dto.contractNumber;
    if (dto.monthlyRent !== undefined) data.monthlyRent = dto.monthlyRent;
    if (dto.adminFeePercentage !== undefined) data.adminFeePercentage = dto.adminFeePercentage;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.nextAdjustmentDate !== undefined)
      data.nextAdjustmentDate = new Date(dto.nextAdjustmentDate);

    const lease = await this.prisma.lease.update({
      where: { id },
      data,
      include: { property: true, responsibleBroker: true },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        userId: auth.userId,
        action: "LEASE_UPDATED",
        entity: "Lease",
        entityId: id,
        metadata: { status: dto.status },
      },
    });

    return this.toDto(lease);
  }

  async addTenant(auth: AuthContext, leaseId: string, dto: AddLeaseTenantDto): Promise<void> {
    await this.findById(auth, leaseId);

    const client = await this.prisma.client.findUnique({
      where: { id: dto.clientId },
    });

    if (!client || client.tenantId !== auth.tenantId) {
      throw new NotFoundException("Cliente não encontrado");
    }

    await this.prisma.leaseTenant.create({
      data: {
        tenantId: auth.tenantId,
        leaseId,
        clientId: dto.clientId,
        percentage: dto.percentage,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        userId: auth.userId,
        action: "LEASE_TENANT_ADDED",
        entity: "LeaseTenant",
        entityId: leaseId,
        metadata: { clientId: dto.clientId },
      },
    });
  }

  async addOwner(auth: AuthContext, leaseId: string, dto: AddLeaseOwnerDto): Promise<void> {
    await this.findById(auth, leaseId);

    const client = await this.prisma.client.findUnique({
      where: { id: dto.clientId },
    });

    if (!client || client.tenantId !== auth.tenantId) {
      throw new NotFoundException("Cliente não encontrado");
    }

    await this.prisma.leaseOwner.create({
      data: {
        tenantId: auth.tenantId,
        leaseId,
        clientId: dto.clientId,
        percentage: dto.percentage,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        userId: auth.userId,
        action: "LEASE_OWNER_ADDED",
        entity: "LeaseOwner",
        entityId: leaseId,
        metadata: { clientId: dto.clientId },
      },
    });
  }

  private toDto(lease: any): LeaseDto {
    return {
      id: lease.id,
      contractNumber: lease.contractNumber,
      propertyId: lease.propertyId,
      responsibleBrokerId: lease.responsibleBrokerId,
      monthlyRent: Number(lease.monthlyRent),
      condoFee: lease.condoFee ? Number(lease.condoFee) : null,
      iptuFee: lease.iptuFee ? Number(lease.iptuFee) : null,
      startDate: lease.startDate.toISOString(),
      endDate: lease.endDate.toISOString(),
      dueDay: lease.dueDay,
      guaranteeType: lease.guaranteeType,
      adminFeePercentage: Number(lease.adminFeePercentage),
      adjustmentIndex: lease.adjustmentIndex,
      nextAdjustmentDate: lease.nextAdjustmentDate?.toISOString() || null,
      status: lease.status,
      createdAt: lease.createdAt.toISOString(),
      updatedAt: lease.updatedAt.toISOString(),
    };
  }
}
