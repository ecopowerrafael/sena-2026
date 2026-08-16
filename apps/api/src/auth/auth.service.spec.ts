import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import { AuditService } from "../audit/audit.service";
import { AuthService } from "./auth.service";
import { PasswordService } from "./password.service";
import { SessionService } from "./session.service";

type Mocked<T> = { [K in keyof T]: jest.Mock };

const tenantAtivo = {
  id: "tenant-1",
  name: "SENA",
  slug: "sena",
  status: "ACTIVE",
  deletedAt: null,
};

const usuarioAtivo = {
  id: "user-1",
  tenantId: "tenant-1",
  name: "Carlos Sena",
  email: "admin@senaimoveis.com.br",
  passwordHash: "hash",
  role: "ADMIN" as const,
  status: "ACTIVE",
  deletedAt: null,
  tenant: tenantAtivo,
};

describe("AuthService", () => {
  let prisma: {
    user: Mocked<{ findFirst: unknown; update: unknown }>;
    passwordResetToken: Mocked<{ findUnique: unknown; create: unknown; update: unknown }>;
    refreshSession: Mocked<{ updateMany: unknown }>;
    $transaction: jest.Mock;
  };
  let passwords: PasswordService;
  let sessions: Mocked<Pick<SessionService, "issue" | "rotate" | "revokeByRefreshToken">>;
  let audit: { record: jest.Mock };
  let service: AuthService;

  const fingerprint = { ip: "127.0.0.1", userAgent: "jest" };

  beforeEach(() => {
    prisma = {
      user: { findFirst: jest.fn(), update: jest.fn().mockResolvedValue({}) },
      passwordResetToken: {
        findUnique: jest.fn(),
        create: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
      },
      refreshSession: { updateMany: jest.fn().mockResolvedValue({}) },
      $transaction: jest.fn().mockResolvedValue([]),
    };
    passwords = new PasswordService();
    sessions = {
      issue: jest.fn().mockResolvedValue({
        accessToken: "access",
        refreshToken: "refresh",
        csrfToken: "csrf",
        sessionId: "sess-1",
      }),
      rotate: jest.fn(),
      revokeByRefreshToken: jest.fn().mockResolvedValue("user-1"),
    };
    audit = { record: jest.fn().mockResolvedValue(undefined) };

    service = new AuthService(
      prisma as never,
      passwords,
      sessions as unknown as SessionService,
      audit as unknown as AuditService
    );
  });

  describe("login", () => {
    it("autentica com credenciais corretas e abre sessão", async () => {
      prisma.user.findFirst.mockResolvedValue(usuarioAtivo);
      jest.spyOn(passwords, "verify").mockResolvedValue(true);

      const result = await service.login("Admin@SenaImoveis.com.BR", "senha-correta", fingerprint);

      expect(result.user).toMatchObject({ id: "user-1", role: "ADMIN", tenantId: "tenant-1" });
      expect(result.session.accessToken).toBe("access");
      // e-mail é normalizado antes da consulta
      expect(prisma.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: "admin@senaimoveis.com.br", deletedAt: null },
        })
      );
      expect(audit.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: "auth.login.success" })
      );
    });

    it("recusa senha incorreta sem revelar o motivo", async () => {
      prisma.user.findFirst.mockResolvedValue(usuarioAtivo);
      jest.spyOn(passwords, "verify").mockResolvedValue(false);

      await expect(
        service.login("admin@senaimoveis.com.br", "errada", fingerprint)
      ).rejects.toThrow(new UnauthorizedException("E-mail ou senha inválidos."));
      expect(sessions.issue).not.toHaveBeenCalled();
      expect(audit.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: "auth.login.failed" })
      );
    });

    it("recusa e-mail inexistente com a mesma mensagem", async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.login("ninguem@sena.com", "qualquer", fingerprint)).rejects.toThrow(
        "E-mail ou senha inválidos."
      );
    });

    it("recusa usuário inativo mesmo com senha correta", async () => {
      prisma.user.findFirst.mockResolvedValue({ ...usuarioAtivo, status: "INACTIVE" });
      jest.spyOn(passwords, "verify").mockResolvedValue(true);

      await expect(service.login("admin@senaimoveis.com.br", "senha", fingerprint)).rejects.toThrow(
        "E-mail ou senha inválidos."
      );
      expect(sessions.issue).not.toHaveBeenCalled();
      expect(audit.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "auth.login.blocked",
          metadata: { reason: "user_inactive" },
        })
      );
    });

    it("recusa acesso quando o tenant está suspenso", async () => {
      prisma.user.findFirst.mockResolvedValue({
        ...usuarioAtivo,
        tenant: { ...tenantAtivo, status: "SUSPENDED" },
      });
      jest.spyOn(passwords, "verify").mockResolvedValue(true);

      await expect(service.login("admin@senaimoveis.com.br", "senha", fingerprint)).rejects.toThrow(
        "E-mail ou senha inválidos."
      );
    });
  });

  describe("refresh", () => {
    it("falha sem refresh token", async () => {
      await expect(service.refresh(undefined, fingerprint)).rejects.toThrow("Sessão expirada.");
    });

    it("falha quando a sessão foi revogada", async () => {
      sessions.rotate.mockResolvedValue(null);

      await expect(service.refresh("token-revogado", fingerprint)).rejects.toThrow(
        "Sessão expirada."
      );
    });
  });

  describe("recuperação de senha", () => {
    it("não revela e-mail inexistente", async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.requestPasswordReset("ninguem@sena.com", fingerprint)
      ).resolves.toBeNull();
      expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
    });

    it("emite token para usuário válido", async () => {
      prisma.user.findFirst.mockResolvedValue(usuarioAtivo);

      const result = await service.requestPasswordReset("admin@senaimoveis.com.br", fingerprint);

      expect(result?.token).toEqual(expect.any(String));
      expect(prisma.passwordResetToken.create).toHaveBeenCalled();
    });

    it("rejeita token expirado", async () => {
      prisma.passwordResetToken.findUnique.mockResolvedValue({
        id: "tok-1",
        userId: "user-1",
        tenantId: "tenant-1",
        usedAt: null,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(service.resetPassword("token", "SenhaNova2026")).rejects.toThrow(
        BadRequestException
      );
    });

    it("rejeita token já utilizado", async () => {
      prisma.passwordResetToken.findUnique.mockResolvedValue({
        id: "tok-1",
        userId: "user-1",
        tenantId: "tenant-1",
        usedAt: new Date(),
        expiresAt: new Date(Date.now() + 60_000),
      });

      await expect(service.resetPassword("token", "SenhaNova2026")).rejects.toThrow(
        BadRequestException
      );
    });

    it("rejeita senha fora da política antes de consultar o token", async () => {
      await expect(service.resetPassword("token", "curta")).rejects.toThrow(BadRequestException);
      expect(prisma.passwordResetToken.findUnique).not.toHaveBeenCalled();
    });
  });
});
