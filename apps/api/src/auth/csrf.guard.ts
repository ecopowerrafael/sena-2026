import {
  ForbiddenException,
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { CSRF_COOKIE, CSRF_HEADER } from "@sena/shared";
import { IS_PUBLIC_KEY, type RequestWithAuth } from "./decorators";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * CSRF double-submit: operações mutáveis feitas com cookie precisam repetir
 * o valor do cookie legível no header (ARCHITECTURE.md §8.3).
 * Chamadas com Bearer token não usam cookie e ficam de fora.
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithAuth>();

    if (SAFE_METHODS.has(request.method)) {
      return true;
    }

    if (request.headers.authorization?.startsWith("Bearer ")) {
      return true;
    }

    const cookieToken = (request.cookies as Record<string, string> | undefined)?.[CSRF_COOKIE];
    const headerToken = request.headers[CSRF_HEADER];
    const received = Array.isArray(headerToken) ? headerToken[0] : headerToken;

    if (!cookieToken || !received || cookieToken !== received) {
      throw new ForbiddenException("Token CSRF ausente ou inválido.");
    }

    return true;
  }
}
