import {
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ACCESS_COOKIE } from "./cookies";
import { IS_PUBLIC_KEY, type RequestWithAuth } from "./decorators";
import { SessionService } from "./session.service";

/**
 * Guard global: sem cookie de sessão válido, nenhuma rota responde.
 * Rotas marcadas com @Public() são a exceção explícita.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly sessions: SessionService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException("Autenticação obrigatória.");
    }

    try {
      const payload = await this.sessions.verifyAccessToken(token);

      // O access token é curto, mas a sessão pode ter sido revogada antes de expirar.
      if (!(await this.sessions.isSessionActive(payload.sid))) {
        throw new UnauthorizedException("Sessão encerrada.");
      }

      request.auth = {
        userId: payload.sub,
        tenantId: payload.tenantId,
        role: payload.role,
        email: payload.email,
        sessionId: payload.sid,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException("Sessão inválida ou expirada.");
    }
  }

  private extractToken(request: RequestWithAuth): string | undefined {
    const fromCookie = (request.cookies as Record<string, string> | undefined)?.[ACCESS_COOKIE];

    if (fromCookie) {
      return fromCookie;
    }

    // Aceito apenas para clientes não-browser (integrações, testes de API).
    const authorization = request.headers.authorization;

    return authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;
  }
}
