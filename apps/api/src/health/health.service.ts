import { Injectable } from "@nestjs/common";
import type { HealthResponse, ReadyResponse } from "@sena/shared";
import { PrismaService } from "../database/prisma.service";

export const API_VERSION = "0.1.0";

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  check(): HealthResponse {
    return {
      status: "ok",
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      version: API_VERSION,
    };
  }

  async ready(): Promise<ReadyResponse> {
    const databaseUp = await this.prisma.isHealthy();

    return {
      status: databaseUp ? "ready" : "not_ready",
      checks: { database: databaseUp ? "up" : "down" },
      timestamp: new Date().toISOString(),
    };
  }
}
