import { NotFoundException } from "@nestjs/common";
import type { AuthContext } from "../auth/auth.types";
import { PasswordService } from "../auth/password.service";
import type { SessionService } from "../auth/session.service";
import type { AuditService } from "../audit/audit.service";
import { UsersService } from "./users.service";

const authTenantA: AuthContext = {
  userId: "user-a",
  tenantId: "tenant-a",
  role: "ADMIN",
  email: "admin@a.com",
  sessionId: "sess-a",
};

describe("UsersService — isolamento por tenant", () => {
  const prisma = {
    user: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
  };
  const sessions = { revokeAllForUser: jest.fn().mockResolvedValue(undefined) };
  const audit = { record: jest.fn().mockResolvedValue(undefined) };

  const service = new UsersService(
    prisma as never,
    new PasswordService(),
    sessions as unknown as SessionService,
    audit as unknown as AuditService
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lista apenas usuários do tenant autenticado", async () => {
    prisma.user.findMany.mockResolvedValue([]);

    await service.list(authTenantA);

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: "tenant-a", deletedAt: null },
      })
    );
  });

  it("responde 404 ao ler usuário de outro tenant", async () => {
    // O registro existe no banco, mas não dentro do escopo do tenant: a query não o encontra.
    prisma.user.findFirst.mockResolvedValue(null);

    await expect(service.findById(authTenantA, "user-do-tenant-b")).rejects.toThrow(
      NotFoundException
    );
    expect(prisma.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user-do-tenant-b", tenantId: "tenant-a", deletedAt: null },
      })
    );
  });

  it("responde 404 ao alterar status de usuário de outro tenant", async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    await expect(service.setStatus(authTenantA, "user-do-tenant-b", "INACTIVE")).rejects.toThrow(
      NotFoundException
    );
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("cria usuário sempre no tenant do contexto, ignorando qualquer outro", async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: "novo",
      name: "Novo",
      email: "novo@a.com",
      role: "BROKER",
      status: "ACTIVE",
      lastLoginAt: null,
      createdAt: new Date(),
      brokerProfile: null,
    });

    await service.create(authTenantA, {
      name: "Novo",
      email: "Novo@A.com",
      password: "SenhaValida2026",
      role: "BROKER",
    });

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tenantId: "tenant-a", email: "novo@a.com" }),
      })
    );
  });

  it("revoga sessões ao desativar um usuário", async () => {
    prisma.user.findFirst.mockResolvedValue({ id: "user-b", tenantId: "tenant-a" });
    prisma.user.update.mockResolvedValue({
      id: "user-b",
      name: "Beto",
      email: "beto@a.com",
      role: "BROKER",
      status: "INACTIVE",
      lastLoginAt: null,
      createdAt: new Date(),
      brokerProfile: null,
    });

    await service.setStatus(authTenantA, "user-b", "INACTIVE");

    expect(sessions.revokeAllForUser).toHaveBeenCalledWith("user-b");
  });
});
