import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from "@nestjs/common";
import type { Observable } from "rxjs";
import { map } from "rxjs/operators";

const isEnvelope = (value: unknown): boolean =>
  typeof value === "object" && value !== null && ("data" in value || "error" in value);

/** Envelopa toda resposta de sucesso em `{ data }` (ARCHITECTURE.md §5.2). */
@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next
      .handle()
      .pipe(map((payload) => (isEnvelope(payload) ? payload : { data: payload })));
  }
}
