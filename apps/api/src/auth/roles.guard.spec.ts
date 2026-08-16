import { ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { ExecutionContext } from "@nestjs/common";
import type { UserRole } from "@sena/shared";
import { RolesGuard } from "./roles.guard";

function contextWith(role: UserRole | null): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () =>
        role
          ? { auth: { userId: "u1", tenantId: "t1", role, email: "a@b.c", sessionId: "s1" } }
          : {},
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe("RolesGuard", () => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);

  it("libera rota sem @Roles", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(undefined);

    expect(guard.canActivate(contextWith("BROKER"))).toBe(true);
  });

  it("libera papel autorizado", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["ADMIN", "MANAGER"]);

    expect(guard.canActivate(contextWith("MANAGER"))).toBe(true);
  });

  it("bloqueia papel sem permissão", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["ADMIN"]);

    expect(() => guard.canActivate(contextWith("BROKER"))).toThrow(ForbiddenException);
  });

  it("bloqueia requisição sem contexto autenticado", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["ADMIN"]);

    expect(() => guard.canActivate(contextWith(null))).toThrow(ForbiddenException);
  });
});
