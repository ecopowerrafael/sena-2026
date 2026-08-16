import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { UserRole } from "@sena/shared";
import { AuditService } from "../audit/audit.service";
import { PasswordService } from "../auth/password.service";
import { SessionService } from "../auth/session.service";
import type { AuthContext } from "../auth/auth.types";
import { PrismaService } from "../database/prisma.service";
import type { CreateUserDto } from "./users.dto";

export interface UserView {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "ACTIVE" | "INACTIVE";
  creci: string | null;
  phone: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly sessions: SessionService,
    private readonly audit: AuditService
  ) {}

  /** Toda query é escopada pelo tenant do contexto autenticado. */
  async list(auth: AuthContext): Promise<UserView[]> {
    const users = await this.prisma.user.findMany({
      where: { tenantId: auth.tenantId, deletedAt: null },
      include: { brokerProfile: true },
      orderBy: { name: "asc" },
    });

    return users.map((user) => this.toView(user));
  }

  async findById(auth: AuthContext, id: string): Promise<UserView> {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId: auth.tenantId, deletedAt: null },
      include: { brokerProfile: true },
    });

    // 404 (e não 403) para não permitir enumeração de IDs entre tenants (ARCHITECTURE.md §7.3).
    if (!user) {
      throw new NotFoundException("Usuário não encontrado.");
    }

    return this.toView(user);
  }

  async create(auth: AuthContext, dto: CreateUserDto): Promise<UserView> {
    const problems = this.passwords.validatePolicy(dto.password);

    if (problems.length > 0) {
      throw new BadRequestException(problems.join(" "));
    }

    const email = dto.email.trim().toLowerCase();

    const existing = await this.prisma.user.findFirst({
      where: { tenantId: auth.tenantId, email },
    });

    if (existing) {
      throw new ConflictException("Já existe um usuário com este e-mail.");
    }

    const user = await this.prisma.user.create({
      data: {
        tenantId: auth.tenantId,
        name: dto.name.trim(),
        email,
        passwordHash: await this.passwords.hash(dto.password),
        role: dto.role,
        ...(dto.role === "BROKER" || dto.creci || dto.phone
          ? {
              brokerProfile: {
                create: {
                  tenantId: auth.tenantId,
                  creci: dto.creci ?? null,
                  phone: dto.phone ?? null,
                },
              },
            }
          : {}),
      },
      include: { brokerProfile: true },
    });

    await this.audit.record({
      action: "user.created",
      tenantId: auth.tenantId,
      userId: auth.userId,
      entity: "User",
      entityId: user.id,
      metadata: { role: user.role },
    });

    return this.toView(user);
  }

  async setStatus(auth: AuthContext, id: string, status: "ACTIVE" | "INACTIVE"): Promise<UserView> {
    if (id === auth.userId && status === "INACTIVE") {
      throw new BadRequestException("Você não pode desativar o próprio acesso.");
    }

    const target = await this.prisma.user.findFirst({
      where: { id, tenantId: auth.tenantId, deletedAt: null },
    });

    if (!target) {
      throw new NotFoundException("Usuário não encontrado.");
    }

    const user = await this.prisma.user.update({
      where: { id: target.id },
      data: { status },
      include: { brokerProfile: true },
    });

    // Desativou: as sessões abertas do usuário perdem validade imediatamente.
    if (status === "INACTIVE") {
      await this.sessions.revokeAllForUser(user.id);
    }

    await this.audit.record({
      action: status === "ACTIVE" ? "user.activated" : "user.deactivated",
      tenantId: auth.tenantId,
      userId: auth.userId,
      entity: "User",
      entityId: user.id,
    });

    return this.toView(user);
  }

  private toView(user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: string;
    lastLoginAt: Date | null;
    createdAt: Date;
    brokerProfile?: { creci: string | null; phone: string | null } | null;
  }): UserView {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status as "ACTIVE" | "INACTIVE",
      creci: user.brokerProfile?.creci ?? null,
      phone: user.brokerProfile?.phone ?? null,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
