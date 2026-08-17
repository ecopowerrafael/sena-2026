import { SetMetadata, createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { UserRole } from "@sena/shared";
import type { Request } from "express";
import type { AuthContext } from "./auth.types";

export const IS_PUBLIC_KEY = "sena:isPublic";
export const ROLES_KEY = "sena:roles";

/** Marca a rota como acessível sem sessão. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/** Restringe a rota aos papéis informados. */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export interface RequestWithAuth extends Request {
  auth?: AuthContext;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthContext => {
    const request = ctx.switchToHttp().getRequest<RequestWithAuth>();

    if (!request.auth) {
      throw new Error("Rota autenticada sem contexto de sessão.");
    }

    return request.auth;
  }
);

export const Auth = CurrentUser;
