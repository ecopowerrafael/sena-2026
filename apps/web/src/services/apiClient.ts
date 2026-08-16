import { CSRF_COOKIE, CSRF_HEADER, type ApiError, type ApiErrorBody } from "@sena/shared";

const BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3333/api/v1").replace(
  /\/$/,
  ""
);

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    readonly body: ApiErrorBody
  ) {
    super(body.message);
    this.name = "ApiRequestError";
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Interno: evita laço de refresh. */
  skipRefresh?: boolean;
}

function readCookie(name: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`))
    ?.split("=")[1];
}

async function rawRequest(path: string, options: RequestOptions): Promise<Response> {
  const { body, headers, method = "GET", ...rest } = options;
  const csrf = readCookie(CSRF_COOKIE);

  return fetch(`${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`, {
    ...rest,
    method,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(!SAFE_METHODS.has(method) && csrf ? { [CSRF_HEADER]: csrf } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

let refreshInFlight: Promise<boolean> | null = null;

/** Uma única rotação por vez, mesmo com várias requisições falhando juntas. */
async function refreshSession(): Promise<boolean> {
  refreshInFlight ??= rawRequest("/auth/refresh", { method: "POST", skipRefresh: true })
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

/**
 * Cliente HTTP: envelope `{ data }` / `{ error }` (ARCHITECTURE.md §5.2),
 * cookie de sessão HttpOnly, header CSRF em operações mutáveis e
 * uma tentativa de refresh quando o access token expira.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response = await rawRequest(path, options);

  if (response.status === 401 && !options.skipRefresh && (await refreshSession())) {
    response = await rawRequest(path, { ...options, skipRefresh: true });
  }

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorBody = (payload as ApiError | null)?.error ?? {
      code: "INTERNAL_ERROR" as const,
      message: `Falha na requisição (${response.status}).`,
    };
    throw new ApiRequestError(response.status, errorBody);
  }

  return (payload as { data: T }).data;
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: "DELETE" }),
};
