import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import type { SessionUser } from "@sena/shared";
import type { Request, Response } from "express";
import { ENV } from "../config/config.module";
import type { Env } from "../config/env";
import { AuthService } from "./auth.service";
import { ForgotPasswordDto, LoginDto, ResetPasswordDto } from "./auth.dto";
import type { AuthContext } from "./auth.types";
import { REFRESH_COOKIE, clearSessionCookies, setSessionCookies } from "./cookies";
import { CurrentUser, Public } from "./decorators";
import { SessionService, type RequestFingerprint } from "./session.service";

function fingerprint(req: Request): RequestFingerprint {
  return { ip: req.ip ?? null, userAgent: req.headers["user-agent"] ?? null };
}

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly sessions: SessionService,
    @Inject(ENV) private readonly env: Env
  ) {}

  @Public()
  @Throttle({ login: { limit: 5, ttl: 60_000 } })
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Autentica e abre sessão por cookie HttpOnly." })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<SessionUser> {
    const { session, user } = await this.auth.login(dto.email, dto.password, fingerprint(req));

    this.applyCookies(res, session);

    return user;
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Rotaciona a sessão a partir do refresh token." })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<SessionUser> {
    const refreshToken = (req.cookies as Record<string, string> | undefined)?.[REFRESH_COOKIE];
    const { session, user } = await this.auth.refresh(refreshToken, fingerprint(req));

    this.applyCookies(res, session);

    return user;
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Revoga a sessão atual e limpa os cookies." })
  async logout(
    @CurrentUser() auth: AuthContext,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ ok: true }> {
    const refreshToken = (req.cookies as Record<string, string> | undefined)?.[REFRESH_COOKIE];

    await this.auth.logout(refreshToken, auth);
    clearSessionCookies(res, this.env.NODE_ENV === "production");

    return { ok: true };
  }

  @Get("me")
  @ApiOperation({ summary: "Usuário da sessão corrente." })
  me(@CurrentUser() auth: AuthContext): Promise<SessionUser> {
    return this.auth.me(auth);
  }

  @Public()
  @Throttle({ login: { limit: 5, ttl: 60_000 } })
  @Post("password/forgot")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Solicita recuperação de senha." })
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
    @Req() req: Request
  ): Promise<{ ok: true; token?: string }> {
    const result = await this.auth.requestPasswordReset(dto.email, fingerprint(req));

    // Resposta idêntica exista ou não o e-mail. Em dev o token volta para permitir o fluxo.
    if (result && this.env.NODE_ENV !== "production") {
      return { ok: true, token: result.token };
    }

    return { ok: true };
  }

  @Public()
  @Throttle({ login: { limit: 5, ttl: 60_000 } })
  @Post("password/reset")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Define nova senha a partir do token de recuperação." })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<{ ok: true }> {
    await this.auth.resetPassword(dto.token, dto.password);

    return { ok: true };
  }

  private applyCookies(
    res: Response,
    session: { accessToken: string; refreshToken: string; csrfToken: string }
  ): void {
    setSessionCookies(res, session, {
      isProduction: this.env.NODE_ENV === "production",
      accessMaxAgeMs: this.sessions.accessMaxAgeMs,
      refreshMaxAgeMs: this.sessions.refreshMaxAgeMs,
    });
  }
}
