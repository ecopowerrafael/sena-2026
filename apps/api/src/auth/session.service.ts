import { Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { UserRole } from "@sena/shared";
import { ENV } from "../config/config.module";
import type { Env } from "../config/env";
import { PrismaService } from "../database/prisma.service";
import type { AccessTokenPayload } from "./auth.types";

export interface IssuedSession {
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
  sessionId: string;
}

interface SessionOwner {
  id: string;
  tenantId: string;
  email: string;
  role: UserRole;
}

export interface RequestFingerprint {
  ip?: string | null;
  userAgent?: string | null;
}

/** Hash do refresh token: o valor em claro nunca é persistido (ARCHITECTURE.md §8.3). */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

@Injectable()
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    @Inject(ENV) private readonly env: Env
  ) {}

  get accessMaxAgeMs(): number {
    return this.env.ACCESS_TOKEN_TTL_MINUTES * 60 * 1000;
  }

  get refreshMaxAgeMs(): number {
    return this.env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
  }

  /** Cria uma sessão de refresh nova e o access token correspondente. */
  async issue(user: SessionOwner, fingerprint: RequestFingerprint): Promise<IssuedSession> {
    const refreshToken = randomBytes(48).toString("base64url");

    const session = await this.prisma.refreshSession.create({
      data: {
        tenantId: user.tenantId,
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + this.refreshMaxAgeMs),
        ip: fingerprint.ip?.slice(0, 64) ?? null,
        userAgent: fingerprint.userAgent?.slice(0, 512) ?? null,
      },
    });

    return {
      accessToken: await this.signAccessToken(user, session.id),
      refreshToken,
      csrfToken: randomUUID(),
      sessionId: session.id,
    };
  }

  /**
   * Rotação: valida o refresh recebido, revoga a sessão atual e emite outra.
   * Retorna null quando o token é inválido, expirado, revogado ou o usuário não pode mais entrar.
   */
  async rotate(
    refreshToken: string,
    fingerprint: RequestFingerprint
  ): Promise<{ session: IssuedSession; user: SessionOwner } | null> {
    const current = await this.prisma.refreshSession.findUnique({
      where: { tokenHash: hashToken(refreshToken) },
      include: { user: { include: { tenant: true } } },
    });

    if (!current || current.revokedAt || current.expiresAt.getTime() <= Date.now()) {
      return null;
    }

    const { user } = current;

    if (
      user.status !== "ACTIVE" ||
      user.deletedAt !== null ||
      user.tenant.status !== "ACTIVE" ||
      user.tenant.deletedAt !== null
    ) {
      await this.revokeAllForUser(user.id);
      return null;
    }

    const owner: SessionOwner = {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    };

    const next = await this.issue(owner, fingerprint);

    await this.prisma.refreshSession.update({
      where: { id: current.id },
      data: { revokedAt: new Date(), replacedById: next.sessionId },
    });

    return { session: next, user: owner };
  }

  async revokeByRefreshToken(refreshToken: string): Promise<string | null> {
    const session = await this.prisma.refreshSession.findUnique({
      where: { tokenHash: hashToken(refreshToken) },
    });

    if (!session || session.revokedAt) {
      return null;
    }

    await this.prisma.refreshSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    return session.userId;
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async isSessionActive(sessionId: string): Promise<boolean> {
    const session = await this.prisma.refreshSession.findUnique({ where: { id: sessionId } });

    return Boolean(session && !session.revokedAt && session.expiresAt.getTime() > Date.now());
  }

  verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    return this.jwt.verifyAsync<AccessTokenPayload>(token);
  }

  private signAccessToken(user: SessionOwner, sessionId: string): Promise<string> {
    const payload: AccessTokenPayload = {
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
      sid: sessionId,
    };

    return this.jwt.signAsync(payload);
  }
}
