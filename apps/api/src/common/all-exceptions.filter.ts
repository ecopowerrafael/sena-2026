import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from "@nestjs/common";
import type { ApiError, ApiErrorCode } from "@sena/shared";
import type { Request, Response } from "express";
import { currentRequestId } from "./request-context";

const STATUS_TO_CODE: Record<number, ApiErrorCode> = {
  [HttpStatus.BAD_REQUEST]: "VALIDATION_ERROR",
  [HttpStatus.UNPROCESSABLE_ENTITY]: "VALIDATION_ERROR",
  [HttpStatus.UNAUTHORIZED]: "UNAUTHORIZED",
  [HttpStatus.FORBIDDEN]: "FORBIDDEN",
  [HttpStatus.NOT_FOUND]: "NOT_FOUND",
  [HttpStatus.CONFLICT]: "CONFLICT",
  [HttpStatus.TOO_MANY_REQUESTS]: "RATE_LIMITED",
};

/**
 * Tratamento global de erros (ARCHITECTURE.md §5.2).
 * Sempre responde `{ error: { code, message, fields? } }` e nunca expõe stack trace.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const request = http.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const code = STATUS_TO_CODE[status] ?? "INTERNAL_ERROR";
    const { message, fields } = this.describe(exception, status);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status}: ${message}`,
        exception instanceof Error ? exception.stack : undefined
      );
    }

    const body: ApiError = {
      error: {
        code,
        message,
        ...(fields ? { fields } : {}),
        ...(currentRequestId() ? { requestId: currentRequestId() } : {}),
      },
    };

    response.status(status).json(body);
  }

  private describe(
    exception: unknown,
    status: number
  ): { message: string; fields?: Record<string, string[]> } {
    if (exception instanceof HttpException) {
      const payload = exception.getResponse();

      if (typeof payload === "string") {
        return { message: payload };
      }

      if (payload && typeof payload === "object") {
        const record = payload as Record<string, unknown>;
        const rawMessage = record.message;

        if (Array.isArray(rawMessage)) {
          return {
            message: "Dados inválidos.",
            fields: { _: rawMessage.map(String) },
          };
        }

        if (typeof rawMessage === "string") {
          return { message: rawMessage };
        }
      }

      return { message: exception.message };
    }

    return {
      message:
        status >= HttpStatus.INTERNAL_SERVER_ERROR
          ? "Erro interno do servidor."
          : "Requisição inválida.",
    };
  }
}
