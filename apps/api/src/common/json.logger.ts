import { ConsoleLogger, type LoggerService, type LogLevel } from "@nestjs/common";
import { currentRequestId } from "./request-context";

/**
 * Log estruturado (ARCHITECTURE.md §27): uma linha JSON por evento, com requestId
 * quando existir contexto de requisição. Em desenvolvimento mantém o logger legível do Nest.
 */
export class JsonLogger implements LoggerService {
  private readonly pretty = new ConsoleLogger();

  constructor(private readonly structured: boolean) {}

  log(message: unknown, context?: string): void {
    this.write("log", message, context);
  }

  error(message: unknown, stack?: string, context?: string): void {
    this.write("error", message, context, stack);
  }

  warn(message: unknown, context?: string): void {
    this.write("warn", message, context);
  }

  debug(message: unknown, context?: string): void {
    this.write("debug", message, context);
  }

  verbose(message: unknown, context?: string): void {
    this.write("verbose", message, context);
  }

  private write(level: LogLevel, message: unknown, context?: string, stack?: string): void {
    if (!this.structured) {
      if (level === "error") {
        this.pretty.error(message as string, stack, context);
      } else {
        this.pretty[level](message as string, context);
      }
      return;
    }

    const line = JSON.stringify({
      level,
      time: new Date().toISOString(),
      requestId: currentRequestId(),
      context,
      message: typeof message === "string" ? message : JSON.stringify(message),
      stack,
    });

    if (level === "error" || level === "warn") {
      process.stderr.write(`${line}\n`);
    } else {
      process.stdout.write(`${line}\n`);
    }
  }
}
