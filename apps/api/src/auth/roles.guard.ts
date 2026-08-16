import {
  ForbiddenException,
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { UserRole } from "@sena/shared";
import { ROLES_KEY, type RequestWithAuth } from "./decorators";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) {
      return true;
    }

    const { auth } = context.switchToHttp().getRequest<RequestWithAuth>();

    if (!auth || !required.includes(auth.role)) {
      throw new ForbiddenException("Você não tem permissão para esta operação.");
    }

    return true;
  }
}
