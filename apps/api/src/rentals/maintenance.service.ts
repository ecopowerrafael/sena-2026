import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import type { AuthContext } from "../auth/auth.types";
import type {
  MaintenanceRequestDto,
  ServiceProviderDto,
  MaintenanceQuoteDto,
  MaintenanceEventDto,
} from "@sena/shared";
import {
  CreateMaintenanceRequestDto,
  CreateMaintenanceEventDto,
  CreateServiceProviderDto,
  ApproveMaintenanceQuoteDto,
} from "./rentals.dto";

@Injectable()
export class MaintenanceService {
  constructor(private readonly prisma: PrismaService) {}

  async listRequests(auth: AuthContext, leaseId: string): Promise<MaintenanceRequestDto[]> {
    const lease = await this.prisma.lease.findUnique({ where: { id: leaseId } });

    if (!lease || lease.tenantId !== auth.tenantId) {
      throw new NotFoundException("Contrato não encontrado");
    }

    const requests = await this.prisma.maintenanceRequest.findMany({
      where: { leaseId },
      orderBy: { requestedAt: "desc" },
    });

    return requests.map((r) => this.requestToDto(r));
  }

  async createRequest(
    auth: AuthContext,
    dto: CreateMaintenanceRequestDto
  ): Promise<MaintenanceRequestDto> {
    const lease = await this.prisma.lease.findUnique({
      where: { id: dto.leaseId },
    });

    if (!lease || lease.tenantId !== auth.tenantId) {
      throw new NotFoundException("Contrato não encontrado");
    }

    const request = await this.prisma.maintenanceRequest.create({
      data: {
        tenantId: auth.tenantId,
        leaseId: dto.leaseId,
        description: dto.description,
        status: "REQUESTED",
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        userId: auth.userId,
        action: "MAINTENANCE_REQUESTED",
        entity: "MaintenanceRequest",
        entityId: request.id,
        metadata: { leaseId: dto.leaseId },
      },
    });

    return this.requestToDto(request);
  }

  async createQuote(
    auth: AuthContext,
    requestId: string,
    providerId: string,
    description: string,
    amount: number
  ): Promise<MaintenanceQuoteDto> {
    const request = await this.prisma.maintenanceRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.tenantId !== auth.tenantId) {
      throw new NotFoundException("Solicitação não encontrada");
    }

    const provider = await this.prisma.serviceProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider || provider.tenantId !== auth.tenantId) {
      throw new NotFoundException("Prestador não encontrado");
    }

    const quote = await this.prisma.maintenanceQuote.create({
      data: {
        tenantId: auth.tenantId,
        requestId,
        providerId,
        description,
        amount,
        isApproved: false,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        userId: auth.userId,
        action: "QUOTE_CREATED",
        entity: "MaintenanceQuote",
        entityId: quote.id,
        metadata: { requestId, providerId, amount },
      },
    });

    return this.quoteToDto(quote);
  }

  async approveQuote(auth: AuthContext, quoteId: string): Promise<void> {
    const quote = await this.prisma.maintenanceQuote.findUnique({
      where: { id: quoteId },
    });

    if (!quote || quote.tenantId !== auth.tenantId) {
      throw new NotFoundException("Orçamento não encontrado");
    }

    await this.prisma.maintenanceQuote.update({
      where: { id: quoteId },
      data: { isApproved: true, approvedAt: new Date() },
    });

    // Atualizar status da solicitação
    await this.prisma.maintenanceRequest.update({
      where: { id: quote.requestId },
      data: { status: "APPROVED" },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        userId: auth.userId,
        action: "QUOTE_APPROVED",
        entity: "MaintenanceQuote",
        entityId: quoteId,
      },
    });
  }

  async completeEvent(
    auth: AuthContext,
    dto: CreateMaintenanceEventDto
  ): Promise<MaintenanceEventDto> {
    const request = await this.prisma.maintenanceRequest.findUnique({
      where: { id: dto.requestId },
    });

    if (!request || request.tenantId !== auth.tenantId) {
      throw new NotFoundException("Solicitação não encontrada");
    }

    const provider = await this.prisma.serviceProvider.findUnique({
      where: { id: dto.providerId },
    });

    if (!provider || provider.tenantId !== auth.tenantId) {
      throw new NotFoundException("Prestador não encontrado");
    }

    const event = await this.prisma.maintenanceEvent.create({
      data: {
        tenantId: auth.tenantId,
        requestId: dto.requestId,
        providerId: dto.providerId,
        description: dto.description,
        amount: dto.amount,
        invoiceUrl: dto.invoiceUrl,
        completedAt: new Date(),
      },
    });

    // Atualizar status da solicitação
    await this.prisma.maintenanceRequest.update({
      where: { id: dto.requestId },
      data: { status: "COMPLETED", completedAt: new Date() },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        userId: auth.userId,
        action: "MAINTENANCE_COMPLETED",
        entity: "MaintenanceEvent",
        entityId: event.id,
        metadata: { requestId: dto.requestId, amount: dto.amount },
      },
    });

    return this.eventToDto(event);
  }

  async listProviders(auth: AuthContext): Promise<ServiceProviderDto[]> {
    const providers = await this.prisma.serviceProvider.findMany({
      where: { tenantId: auth.tenantId, isActive: true },
      orderBy: { name: "asc" },
    });

    return providers.map((p) => this.providerToDto(p));
  }

  async createProvider(
    auth: AuthContext,
    dto: CreateServiceProviderDto
  ): Promise<ServiceProviderDto> {
    const provider = await this.prisma.serviceProvider.create({
      data: {
        tenantId: auth.tenantId,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        category: dto.category,
        notes: dto.notes,
        isActive: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        userId: auth.userId,
        action: "PROVIDER_CREATED",
        entity: "ServiceProvider",
        entityId: provider.id,
        metadata: { name: dto.name },
      },
    });

    return this.providerToDto(provider);
  }

  private requestToDto(request: any): MaintenanceRequestDto {
    return {
      id: request.id,
      leaseId: request.leaseId,
      description: request.description,
      status: request.status,
      requestedAt: request.requestedAt.toISOString(),
      completedAt: request.completedAt?.toISOString() || null,
      createdAt: request.createdAt.toISOString(),
    };
  }

  private quoteToDto(quote: any): MaintenanceQuoteDto {
    return {
      id: quote.id,
      requestId: quote.requestId,
      providerId: quote.providerId,
      description: quote.description,
      amount: Number(quote.amount),
      dueDate: quote.dueDate?.toISOString() || null,
      isApproved: quote.isApproved,
      createdAt: quote.createdAt.toISOString(),
      approvedAt: quote.approvedAt?.toISOString() || null,
    };
  }

  private eventToDto(event: any): MaintenanceEventDto {
    return {
      id: event.id,
      requestId: event.requestId,
      providerId: event.providerId,
      description: event.description,
      amount: Number(event.amount),
      completedAt: event.completedAt.toISOString(),
      invoiceUrl: event.invoiceUrl,
      createdAt: event.createdAt.toISOString(),
    };
  }

  private providerToDto(provider: any): ServiceProviderDto {
    return {
      id: provider.id,
      name: provider.name,
      phone: provider.phone,
      email: provider.email,
      category: provider.category,
      notes: provider.notes,
      isActive: provider.isActive,
      createdAt: provider.createdAt.toISOString(),
    };
  }
}
