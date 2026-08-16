import { Controller, Get, HttpCode, HttpStatus, Res } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import type { HealthResponse, ReadyResponse } from "@sena/shared";
import type { Response } from "express";
import { HealthService } from "./health.service";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Liveness da API." })
  check(): HealthResponse {
    return this.health.check();
  }
}

@ApiTags("health")
@Controller("ready")
export class ReadyController {
  constructor(private readonly health: HealthService) {}

  @Get()
  @ApiOperation({ summary: "Readiness da API (inclui MySQL)." })
  async ready(@Res({ passthrough: true }) res: Response): Promise<ReadyResponse> {
    const result = await this.health.ready();
    res.status(result.status === "ready" ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE);
    return result;
  }
}
