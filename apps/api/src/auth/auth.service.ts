import { BadRequestException, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { createHash, randomBytes } from "node:crypto";
import type { SessionUser } from "@sena/shared";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../database/prisma.service";
import type { AuthContext } from "./auth.types";
import { PasswordService } from "./password.service";
import {
  SessionService,
  hashToken,
  type IssuedSession,
  type RequestFingerprint,
} from "./session.service";

const INVALID_CREDENTIALS = "E-mail ou senha inválidos.";
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly sessions: SessionService,
    private readonly audit: AuditService
  ) {}

  /**
   * Login por e-mail e senha. Falha sempre com a mesma mensagem, seja usuário
   * inexistente, senha errada, usuário inativo ou tenant suspenso.
   */
  async login(
    email: string,
    password: string,
    fingerprint: RequestFingerprint
  ): Promise<{ session: IssuedSession; user: SessionUser }> {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.prisma.user.findFirst({
      where: { email: normalizedEmail, deletedAt: null },
      include: { tenant: true },
    });

    if (!user) {
      await this.audit.record({
        action: "auth.login.failed",
        metadata: { email: normalizedEmail, reason: "user_not_found" },
        ip: fingerprint.ip,
        userAgent: fingerprint.userAgent,
      });
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    const passwordMatches = await this.passwords.verify(user.passwordHash, password);

    if (!passwordMatches) {
      await this.audit.record({
        action: "auth.login.failed",
        tenantId: user.tenantId,
        userId: user.id,
        metadata: { reason: "bad_password" },
        ip: fingerprint.ip,
        userAgent: fingerprint.userAgent,
      });
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    if (user.status !== "ACTIVE") {
      await this.audit.record({
        action: "auth.login.blocked",
        tenantId: user.tenantId,
        userId: user.id,
        metadata: { reason: "user_inactive" },
        ip: fingerprint.ip,
        userAgent: fingerprint.userAgent,
      });
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    if (user.tenant.status !== "ACTIVE" || user.tenant.deletedAt !== null) {
      await this.audit.record({
        action: "auth.login.blocked",
        tenantId: user.tenantId,
        userId: user.id,
        metadata: { reason: "tenant_inactive" },
        ip: fingerprint.ip,
        userAgent: fingerprint.userAgent,
      });
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    const session = await this.sessions.issue(
      { id: user.id, tenantId: user.tenantId, email: user.email, role: user.role },
      fingerprint
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await this.audit.record({
      action: "auth.login.success",
      tenantId: user.tenantId,
      userId: user.id,
      ip: fingerprint.ip,
      userAgent: fingerprint.userAgent,
    });

    return {
      session,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        tenantName: user.tenant.name,
        tenantSlug: user.tenant.slug,
      },
    };
  }

  async refresh(
    refreshToken: string | undefined,
    fingerprint: RequestFingerprint
  ): Promise<{ session: IssuedSession; user: SessionUser }> {
    if (!refreshToken) {
      throw new UnauthorizedException("Sessão expirada.");
    }

    const rotated = await this.sessions.rotate(refreshToken, fingerprint);

    if (!rotated) {
      throw new UnauthorizedException("Sessão expirada.");
    }

    return { session: rotated.session, user: await this.sessionUser(rotated.user.id) };
  }

  async logout(refreshToken: string | undefined, auth?: AuthContext): Promise<void> {
    if (refreshToken) {
      await this.sessions.revokeByRefreshToken(refreshToken);
    }

    if (auth) {
      await this.audit.record({
        action: "auth.logout",
        tenantId: auth.tenantId,
        userId: auth.userId,
      });
    }
  }

  async me(auth: AuthContext): Promise<SessionUser> {
    return this.sessionUser(auth.userId);
  }

  /**
   * Recuperação de senha. A resposta é sempre a mesma para não revelar
   * quais e-mails existem. Em dev o token é devolvido para permitir o fluxo
   * sem serviço de e-mail (a Etapa de integrações troca isso por envio real).
   */
  async requestPasswordReset(
    email: string,
    fingerprint: RequestFingerprint
  ): Promise<{ token: string } | null> {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.prisma.user.findFirst({
      where: { email: normalizedEmail, deletedAt: null, status: "ACTIVE" },
      include: { tenant: true },
    });

    if (!user || user.tenant.status !== "ACTIVE") {
      return null;
    }

    const token = randomBytes(32).toString("base64url");

    await this.prisma.passwordResetToken.create({
      data: {
        tenantId: user.tenantId,
        userId: user.id,
        tokenHash: createHash("sha256").update(token).digest("hex"),
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    await this.audit.record({
      action: "auth.password.reset_requested",
      tenantId: user.tenantId,
      userId: user.id,
      ip: fingerprint.ip,
      userAgent: fingerprint.userAgent,
    });

    this.logger.log(`Token de recuperação emitido para o usuário ${user.id}.`);

    return { token };
  }

  /** Consome o token (uso único), troca a senha e revoga todas as sessões. */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const problems = this.passwords.validatePolicy(newPassword);

    if (problems.length > 0) {
      throw new BadRequestException(problems.join(" "));
    }

    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(token) },
    });

    if (!record || record.usedAt || record.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException("Token de recuperação inválido ou expirado.");
    }

    const passwordHash = await this.passwords.hash(newPassword);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.refreshSession.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    await this.audit.record({
      action: "auth.password.reset_completed",
      tenantId: record.tenantId,
      userId: record.userId,
    });
  }

  private async sessionUser(userId: string): Promise<SessionUser> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: { tenant: true },
    });

    if (!user) {
      throw new UnauthorizedException("Sessão expirada.");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      tenantName: user.tenant.name,
      tenantSlug: user.tenant.slug,
    };
  }
}
