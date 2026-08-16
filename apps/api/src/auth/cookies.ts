import type { CookieOptions, Response } from "express";
import { CSRF_COOKIE } from "@sena/shared";

export const ACCESS_COOKIE = "sena_access";
export const REFRESH_COOKIE = "sena_refresh";

interface CookieContext {
  isProduction: boolean;
  accessMaxAgeMs: number;
  refreshMaxAgeMs: number;
}

function baseOptions(isProduction: boolean): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
  };
}

export function setSessionCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string; csrfToken: string },
  ctx: CookieContext
): void {
  res.cookie(ACCESS_COOKIE, tokens.accessToken, {
    ...baseOptions(ctx.isProduction),
    maxAge: ctx.accessMaxAgeMs,
  });

  res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    ...baseOptions(ctx.isProduction),
    maxAge: ctx.refreshMaxAgeMs,
  });

  // Legível pelo browser de propósito: é o par do header no double-submit de CSRF.
  res.cookie(CSRF_COOKIE, tokens.csrfToken, {
    ...baseOptions(ctx.isProduction),
    httpOnly: false,
    maxAge: ctx.refreshMaxAgeMs,
  });
}

export function clearSessionCookies(res: Response, isProduction: boolean): void {
  const options = baseOptions(isProduction);

  res.clearCookie(ACCESS_COOKIE, options);
  res.clearCookie(REFRESH_COOKIE, options);
  res.clearCookie(CSRF_COOKIE, { ...options, httpOnly: false });
}
