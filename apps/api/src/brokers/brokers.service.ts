import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { BrokerDto } from "@sena/shared";
import { AuditService } from "../audit/audit.service";
import type { AuthContext } from "../auth/auth.types";
import { PasswordService } from "../auth/password.service";
import { PrismaService } from "../database/prisma.service";
import type { CreateBrokerDto, UpdateBrokerDto } from "./brokers.dto";

const BROKER_INCLUDE = {
  brokerProfile: { include: { team: { select: { name: true } }, manager: { select: { name: true } } } },
  _count: { select: { leadsAssigned: true } },
} as const;

/**
 * Corretores são usuários do tenant com perfil profissional.
 * Métricas de venda/VGV são derivadas das transações e entram nas próximas etapas.
 */
@Injectable()
export class BrokersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly audit: AuditService
  ) {}

  async list(auth: AuthContext): Promise<BrokerDto[]> {
    const users = await this.prisma.user.findMany({
      where: {
        tenantId: auth.tenantId,
        deletedAt: null,
        role: { in: ["ADMIN", "MANAGER", "BROKER"] },
      },
      include: BROKER_INCLUDE,
      orderBy: { name: "asc" },
    });

    return users.map((user) => this.toDto(user as never));
  }

  async findById(auth: AuthContext, id: string): Promise<BrokerDto> {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId: auth.tenantId, deletedAt: null },
      include: BROKER_INCLUDE,
    });

    if (!user) {
      throw new NotFoundException("Corretor não encontrado.");
    }

    return this.toDto(user as never);
  }

  async create(auth: AuthContext, dto: CreateBrokerDto): Promise<BrokerDto> {
    const problems = this.passwords.validatePolicy(dto.password);

    if (problems.length > 0) {
      throw new BadRequestException(problems.join(" "));
    }

    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findFirst({
      where: { tenantId: auth.tenantId, email },
    });

    if (existing) {
      throw new BadRequestException("Já existe um usuário com este e-mail.");
    }

    const teamId = await this.resolveTeam(auth, dto.teamName);
    await this.assertManager(auth, dto.managerUserId);

    const user = await this.prisma.user.create({
      data: {
        tenantId: auth.tenantId,
        name: dto.name.trim(),
        email,
        passwordHash: await this.passwords.hash(dto.password),
        role: dto.role ?? "BROKER",
        brokerProfile: {
          create: {
            tenantId: auth.tenantId,
            creci: dto.creci ?? null,
            phone: dto.phone ?? null,
            whatsapp: dto.whatsapp ?? dto.phone ?? null,
            teamId,
            managerUserId: dto.managerUserId ?? null,
          },
        },
      },
      include: BROKER_INCLUDE,
    });

    await this.audit.record({
      action: "broker.created",
      tenantId: auth.tenantId,
      userId: auth.userId,
      entity: "User",
      entityId: user.id,
      metadata: { role: user.role },
    });

    return this.toDto(user as never);
  }

  async update(auth: AuthContext, id: string, dto: UpdateBrokerDto): Promise<BrokerDto> {
    const target = await this.prisma.user.findFirst({
      where: { id, tenantId: auth.tenantId, deletedAt: null },
    });

    if (!target) {
      throw new NotFoundException("Corretor não encontrado.");
    }

    const teamId = await this.resolveTeam(auth, dto.teamName);
    await this.assertManager(auth, dto.managerUserId);

    const profileData = {
      ...(dto.creci !== undefined ? { creci: dto.creci } : {}),
      ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
      ...(dto.whatsapp !== undefined ? { whatsapp: dto.whatsapp } : {}),
      ...(teamId ? { teamId } : {}),
      ...(dto.managerUserId !== undefined ? { managerUserId: dto.managerUserId || null } : {}),
      ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl } : {}),
    };

    const user = await this.prisma.user.update({
      where: { id: target.id },
      data: {
        brokerProfile: {
          upsert: {
            create: { tenantId: auth.tenantId, ...profileData },
            update: profileData,
          },
        },
      },
      include: BROKER_INCLUDE,
    });

    await this.audit.record({
      action: "broker.updated",
      tenantId: auth.tenantId,
      userId: auth.userId,
      entity: "User",
      entityId: user.id,
    });

    return this.toDto(user as never);
  }

  private async resolveTeam(auth: AuthContext, teamName?: string): Promise<string | undefined> {
    if (!teamName?.trim()) {
      return undefined;
    }

    const name = teamName.trim();
    const existing = await this.prisma.team.findFirst({
      where: { tenantId: auth.tenantId, name },
    });

    if (existing) {
      return existing.id;
    }

    const team = await this.prisma.team.create({
      data: { tenantId: auth.tenantId, name },
    });

    return team.id;
  }

  private async assertManager(auth: AuthContext, managerUserId?: string): Promise<void> {
    if (!managerUserId) {
      return;
    }

    const manager = await this.prisma.user.findFirst({
      where: {
        id: managerUserId,
        tenantId: auth.tenantId,
        deletedAt: null,
        role: { in: ["ADMIN", "MANAGER"] },
      },
    });

    if (!manager) {
      throw new BadRequestException("Gerente inválido para esta imobiliária.");
    }
  }

  private toDto(user: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    brokerProfile: {
      creci: string | null;
      phone: string | null;
      whatsapp: string | null;
      teamId: string | null;
      managerUserId: string | null;
      avatarUrl: string | null;
      team: { name: string } | null;
      manager: { name: string } | null;
    } | null;
    _count: { leadsAssigned: number };
  }): BrokerDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as BrokerDto["role"],
      status: user.status as BrokerDto["status"],
      creci: user.brokerProfile?.creci ?? null,
      phone: user.brokerProfile?.phone ?? null,
      whatsapp: user.brokerProfile?.whatsapp ?? null,
      teamId: user.brokerProfile?.teamId ?? null,
      teamName: user.brokerProfile?.team?.name ?? null,
      managerUserId: user.brokerProfile?.managerUserId ?? null,
      managerName: user.brokerProfile?.manager?.name ?? null,
      avatarUrl: user.brokerProfile?.avatarUrl ?? null,
      leadsCount: user._count.leadsAssigned,
    };
  }
}
