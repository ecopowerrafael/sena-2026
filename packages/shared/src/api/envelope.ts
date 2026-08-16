/**
 * Contratos de resposta da API (ARCHITECTURE.md §5.2).
 * Toda resposta de sucesso é envelopada em `data`; erros em `error`.
 */

export const API_PREFIX = "/api/v1";

export interface ApiData<T> {
  data: T;
}

export interface ApiListMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiList<T> {
  data: T[];
  meta: ApiListMeta;
}

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export interface ApiErrorBody {
  code: ApiErrorCode;
  message: string;
  fields?: Record<string, string[]>;
  requestId?: string;
}

export interface ApiError {
  error: ApiErrorBody;
}
