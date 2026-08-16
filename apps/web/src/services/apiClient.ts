import type { ApiError, ApiErrorBody, HealthResponse } from "@sena/shared";

const BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3333/api/v1").replace(
  /\/$/,
  ""
);

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
}

/**
 * Cliente HTTP base da Etapa 0.
 * Desenvolve o contrato de `{ data }` / `{ error }` definido em ARCHITECTURE.md §5.2.
 * Ainda não há autenticação: `credentials: "include"` já fica pronto para o cookie da Etapa 1.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  const response = await fetch(`${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`, {
    ...rest,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

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

export const getHealth = (): Promise<HealthResponse> => api.get<HealthResponse>("/health");
