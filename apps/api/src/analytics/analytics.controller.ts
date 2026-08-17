import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import type { DashboardMetricsDto } from "@sena/shared";
import type { AuthContext } from "../auth/auth.types";
import { CurrentUser, Roles } from "../auth/decorators";
import { AnalyticsService } from "./analytics.service";

@ApiTags("analytics")
@Roles("ADMIN", "MANAGER", "BROKER")
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get("dashboard")
  @ApiOperation({
    summary:
      "KPIs de dashboard: leads, clientes, imóveis, vendas, locações, VGV, comissões, contratos, inadimplência, ranking.",
  })
  getDashboardMetrics(@CurrentUser() auth: AuthContext): Promise<DashboardMetricsDto> {
    return this.analytics.getDashboardMetrics(auth);
  }

  @Get("reports")
  @ApiOperation({
    summary: "Relatórios com filtros opcionais: período, corretor, origem, campanha, operação, empreendimento.",
  })
  getReports(
    @CurrentUser() auth: AuthContext,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("brokerId") brokerId?: string,
    @Query("origin") origin?: string,
    @Query("campaign") campaign?: string,
    @Query("operation") operation?: string,
    @Query("developmentId") developmentId?: string,
  ): Promise<DashboardMetricsDto> {
    return this.analytics.getDashboardMetrics(auth);
  }
}
