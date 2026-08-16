import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { ApiListMeta, ClientDto, ClientRoleValue } from "@sena/shared";
import { AuditService } from "../audit/audit.service";
import type { AuthContext } from "../auth/auth.types";
import { CryptoService } from "../common/crypto.service";
import { maskDocument, normalizeDocument } from "../common/documents";
import { ownerScope } from "../common/scope";
import { PrismaService } from "../database/prisma.service";
import type { CreateClientDto, ListClientsQueryDto, UpdateClientDto } from "./clients.dto";

interface ClientRecord {
  id: string;
  type: string;
  name: string;
  documentType: string | null;
  documentLast4: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  responsibleBrokerId: string | null;
  lastContactAt: Date | null;
  nextContactAt: Date | null;
  notes: string | null;
  createdAt: Date;
  roles?: { role: string }[];
  responsibleBroker?: { name: string } | null;
}

@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
    private readonly audit: AuditService
  ) {}

  async list(
    auth: AuthContext,
    query: ListClientsQueryDto
  ): Promise<{ data: ClientDto[]; meta: ApiListMeta }> {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 25, 100);

    const where = {
      tenantId: auth.tenantId,
      ...(query.includeArchived ? {} : { deletedAt: null }),
      ...ownerScope(auth, "responsibleBrokerId"),
      ...(query.responsibleBrokerId ? { responsibleBrokerId: query.responsibleBrokerId } : {}),
      ...(query.role ? { roles: { some: { role: query.role as never } } } : {}),
      ...(query.search ? { OR: this.searchFilter(query.search) } : {}),
    };

    const [total, clients] = await Promise.all([
      this.prisma.client.count({ where: where as never }),
      this.prisma.client.findMany({
        where: where as never,
        include: { roles: true, responsibleBroker: { select: { name: true } } },
        orderBy: { name: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      data: clients.map((client) => this.toDto(client as ClientRecord)),
      meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
    };
  }

  async findById(auth: AuthContext, id: string): Promise<ClientDto> {
    const client = await this.prisma.client.findFirst({
      where: {
        id,
        tenantId: auth.tenantId,
        deletedAt: null,
        ...ownerScope(auth, "responsibleBrokerId"),
      },
      include: { roles: true, responsibleBroker: { select: { name: true } } },
    });

    if (!client) {
      throw new NotFoundException("Cliente não encontrado.");
    }

    return this.toDto(client as ClientRecord);
  }

  async create(auth: AuthContext, dto: CreateClientDto): Promise<ClientDto> {
    const document = this.prepareDocument(dto.document);

    if (document) {
      await this.assertDocumentIsUnique(auth.tenantId, document.hash, null);
    }

    await this.assertBrokerBelongsToTenant(auth, dto.responsibleBrokerId);

    const client = await this.prisma.client.create({
      data: {
        tenantId: auth.tenantId,
        name: dto.name.trim(),
        type: (dto.type ?? "PERSON") as never,
        documentType: (document?.type ?? null) as never,
        documentEncrypted: document?.encrypted ?? null,
        documentHash: document?.hash ?? null,
        documentLast4: document?.last4 ?? null,
        phone: dto.phone ?? null,
        whatsapp: dto.whatsapp ?? dto.phone ?? null,
        email: dto.email?.trim().toLowerCase() ?? null,
        responsibleBrokerId: dto.responsibleBrokerId ?? auth.userId,
        lastContactAt: dto.lastContactAt ? new Date(dto.lastContactAt) : null,
        nextContactAt: dto.nextContactAt ? new Date(dto.nextContactAt) : null,
        notes: dto.notes ?? null,
        roles: {
          create: (dto.roles ?? ["BUYER"]).map((role) => ({
            tenantId: auth.tenantId,
            role: role as never,
          })),
        },
      },
      include: { roles: true, responsibleBroker: { select: { name: true } } },
    });

    await this.audit.record({
      action: "client.created",
      tenantId: auth.tenantId,
      userId: auth.userId,
      entity: "Client",
      entityId: client.id,
    });

    return this.toDto(client as ClientRecord);
  }

  async update(auth: AuthContext, id: string, dto: UpdateClientDto): Promise<ClientDto> {
    const current = await this.prisma.client.findFirst({
      where: {
        id,
        tenantId: auth.tenantId,
        deletedAt: null,
        ...ownerScope(auth, "responsibleBrokerId"),
      },
    });

    if (!current) {
      throw new NotFoundException("Cliente não encontrado.");
    }

    const document = this.prepareDocument(dto.document);

    if (document) {
      await this.assertDocumentIsUnique(auth.tenantId, document.hash, current.id);
    }

    await this.assertBrokerBelongsToTenant(auth, dto.responsibleBrokerId);

    const client = await this.prisma.client.update({
      where: { id: current.id },
      data: {
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.type ? { type: dto.type as never } : {}),
        ...(document
          ? {
              documentType: document.type as never,
              documentEncrypted: document.encrypted,
              documentHash: document.hash,
              documentLast4: document.last4,
            }
          : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        ...(dto.whatsapp !== undefined ? { whatsapp: dto.whatsapp } : {}),
        ...(dto.email !== undefined ? { email: dto.email?.trim().toLowerCase() ?? null } : {}),
        ...(dto.responsibleBrokerId !== undefined
          ? { responsibleBrokerId: dto.responsibleBrokerId }
          : {}),
        ...(dto.lastContactAt !== undefined
          ? { lastContactAt: dto.lastContactAt ? new Date(dto.lastContactAt) : null }
          : {}),
        ...(dto.nextContactAt !== undefined
          ? { nextContactAt: dto.nextContactAt ? new Date(dto.nextContactAt) : null }
          : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        ...(dto.roles
          ? {
              roles: {
                deleteMany: {},
                create: dto.roles.map((role) => ({
                  tenantId: auth.tenantId,
                  role: role as never,
                })),
              },
            }
          : {}),
      },
      include: { roles: true, responsibleBroker: { select: { name: true } } },
    });

    await this.audit.record({
      action: "client.updated",
      tenantId: auth.tenantId,
      userId: auth.userId,
      entity: "Client",
      entityId: client.id,
    });

    return this.toDto(client as ClientRecord);
  }

  /** Arquivamento lógico: histórico comercial nunca some por ação comum (ARCHITECTURE.md §6.4). */
  async archive(auth: AuthContext, id: string): Promise<{ id: string; archived: true }> {
    const current = await this.prisma.client.findFirst({
      where: { id, tenantId: auth.tenantId, deletedAt: null },
    });

    if (!current) {
      throw new NotFoundException("Cliente não encontrado.");
    }

    const openLeads = await this.prisma.lead.count({
      where: { clientId: current.id, deletedAt: null, status: { notIn: ["CLOSED", "LOST"] } },
    });

    if (openLeads > 0) {
      throw new BadRequestException("Existem leads ativos vinculados a este cliente.");
    }

    await this.prisma.client.update({
      where: { id: current.id },
      data: { deletedAt: new Date() },
    });

    await this.audit.record({
      action: "client.archived",
      tenantId: auth.tenantId,
      userId: auth.userId,
      entity: "Client",
      entityId: current.id,
    });

    return { id: current.id, archived: true };
  }

  /** Busca exata por documento usando o HMAC — nunca decifra a base inteira. */
  private searchFilter(search: string): Record<string, unknown>[] {
    const term = search.trim();
    const filters: Record<string, unknown>[] = [
      { name: { contains: term } },
      { email: { contains: term } },
      { phone: { contains: term } },
      { whatsapp: { contains: term } },
    ];

    const document = normalizeDocument(term);

    if (document) {
      filters.push({ documentHash: this.crypto.hash(document.digits) });
    }

    return filters;
  }

  private prepareDocument(raw?: string): {
    type: "CPF" | "CNPJ";
    encrypted: string;
    hash: string;
    last4: string;
  } | null {
    if (!raw || raw.trim() === "") {
      return null;
    }

    const normalized = normalizeDocument(raw);

    if (!normalized) {
      throw new BadRequestException("CPF/CNPJ inválido.");
    }

    return {
      type: normalized.type,
      encrypted: this.crypto.encrypt(normalized.digits),
      hash: this.crypto.hash(normalized.digits),
      last4: normalized.last4,
    };
  }

  private async assertDocumentIsUnique(
    tenantId: string,
    documentHash: string,
    ignoreClientId: string | null
  ): Promise<void> {
    const duplicate = await this.prisma.client.findFirst({
      where: {
        tenantId,
        documentHash,
        ...(ignoreClientId ? { NOT: { id: ignoreClientId } } : {}),
      },
    });

    if (duplicate) {
      throw new ConflictException("Já existe um cliente com este CPF/CNPJ.");
    }
  }

  private async assertBrokerBelongsToTenant(
    auth: AuthContext,
    brokerId?: string
  ): Promise<void> {
    if (!brokerId) {
      return;
    }

    const broker = await this.prisma.user.findFirst({
      where: { id: brokerId, tenantId: auth.tenantId, deletedAt: null },
    });

    if (!broker) {
      throw new BadRequestException("Corretor responsável inválido.");
    }
  }

  private toDto(client: ClientRecord): ClientDto {
    return {
      id: client.id,
      type: client.type as ClientDto["type"],
      name: client.name,
      documentType: client.documentType as ClientDto["documentType"],
      documentMasked: maskDocument(
        client.documentType as "CPF" | "CNPJ" | null,
        client.documentLast4
      ),
      phone: client.phone,
      whatsapp: client.whatsapp,
      email: client.email,
      roles: (client.roles ?? []).map((assignment) => assignment.role as ClientRoleValue),
      responsibleBrokerId: client.responsibleBrokerId,
      responsibleBrokerName: client.responsibleBroker?.name ?? null,
      lastContactAt: client.lastContactAt?.toISOString() ?? null,
      nextContactAt: client.nextContactAt?.toISOString() ?? null,
      notes: client.notes,
      createdAt: client.createdAt.toISOString(),
    };
  }
}
