import { ForbiddenException, type ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { CSRF_COOKIE, CSRF_HEADER } from "@sena/shared";
import { CsrfGuard } from "./csrf.guard";

function contextWith(request: Record<string, unknown>): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ headers: {}, cookies: {}, ...request }) }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe("CsrfGuard", () => {
  const reflector = new Reflector();
  const guard = new CsrfGuard(reflector);

  beforeEach(() => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
  });

  it("ignora métodos seguros", () => {
    expect(guard.canActivate(contextWith({ method: "GET" }))).toBe(true);
  });

  it("bloqueia POST sem header CSRF", () => {
    expect(() =>
      guard.canActivate(contextWith({ method: "POST", cookies: { [CSRF_COOKIE]: "abc" } }))
    ).toThrow(ForbiddenException);
  });

  it("bloqueia POST com header diferente do cookie", () => {
    expect(() =>
      guard.canActivate(
        contextWith({
          method: "POST",
          cookies: { [CSRF_COOKIE]: "abc" },
          headers: { [CSRF_HEADER]: "outro" },
        })
      )
    ).toThrow(ForbiddenException);
  });

  it("libera POST com par cookie/header coerente", () => {
    expect(
      guard.canActivate(
        contextWith({
          method: "POST",
          cookies: { [CSRF_COOKIE]: "abc" },
          headers: { [CSRF_HEADER]: "abc" },
        })
      )
    ).toBe(true);
  });

  it("libera chamadas com Bearer token (sem cookie)", () => {
    expect(
      guard.canActivate(contextWith({ method: "POST", headers: { authorization: "Bearer token" } }))
    ).toBe(true);
  });
});
