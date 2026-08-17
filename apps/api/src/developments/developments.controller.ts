import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import type { LotDto, LotReservationDto, LotSimulationDto } from "@sena/shared";
import type { AuthContext } from "../auth/auth.types";
import { CurrentUser, Roles } from "../auth/decorators";
import { DevelopmentsService } from "./developments.service";
import { LotsService } from "./lots.service";
import { LotProposalsService } from "./proposals.service";
import { CreateLotDto, ReserveLotDto, SimulateLotDto } from "./developments.dto";

@ApiTags("developments")
@Roles("ADMIN", "MANAGER", "BROKER")
@Controller("developments")
export class DevelopmentsController {
  constructor(
    private readonly developments: DevelopmentsService,
    private readonly lots: LotsService,
    private readonly proposals: LotProposalsService
  ) {}

  // ===== DEVELOPMENTS =====

  @Get()
  @ApiOperation({ summary: "Lista empreendimentos." })
  listDevelopments(@CurrentUser() auth: AuthContext): Promise<any> {
    return this.developments.list(auth);
  }

  @Get(":id")
  @ApiOperation({ summary: "Detalha um empreendimento." })
  findDevelopment(
    @CurrentUser() auth: AuthContext,
    @Param("id") id: string
  ): Promise<any> {
    return this.developments.findById(auth, id);
  }

  @Post()
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "Cria um empreendimento." })
  createDevelopment(
    @CurrentUser() auth: AuthContext,
    @Body() dto: any
  ): Promise<any> {
    return this.developments.create(auth, dto);
  }

  // ===== LOTS =====

  @Get(":developmentId/lots")
  @ApiOperation({ summary: "Lista lotes de um empreendimento." })
  listLots(
    @CurrentUser() auth: AuthContext,
    @Param("developmentId") developmentId: string
  ): Promise<LotDto[]> {
    return this.lots.listByDevelopment(auth, developmentId);
  }

  @Get("lots/:id")
  @ApiOperation({ summary: "Detalha um lote." })
  findLot(
    @CurrentUser() auth: AuthContext,
    @Param("id") id: string
  ): Promise<LotDto> {
    return this.lots.findById(auth, id);
  }

  @Post("lots")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "Cria um lote." })
  createLot(
    @CurrentUser() auth: AuthContext,
    @Body() dto: CreateLotDto
  ): Promise<LotDto> {
    return this.lots.create(auth, dto);
  }

  @Post("lots/reserve")
  @ApiOperation({
    summary: "Reserva um lote (com proteção contra dupla reserva via transaction).",
  })
  reserveLot(
    @CurrentUser() auth: AuthContext,
    @Body() dto: ReserveLotDto
  ): Promise<LotReservationDto> {
    return this.lots.reserve(auth, dto);
  }

  @Get("lots/:id/reservation")
  @ApiOperation({ summary: "Obtém reserva ativa de um lote." })
  getReservation(
    @CurrentUser() auth: AuthContext,
    @Param("id") id: string
  ): Promise<LotReservationDto | null> {
    return this.lots.getReservation(auth, id);
  }

  @Post("lots/simulate")
  @ApiOperation({ summary: "Simula financiamento de um lote." })
  simulateLot(
    @CurrentUser() auth: AuthContext,
    @Body() dto: SimulateLotDto
  ): Promise<LotSimulationDto> {
    return this.lots.simulate(auth, dto);
  }

  // ===== LOT PROPOSALS =====

  @Get(":developmentId/proposals")
  @ApiOperation({ summary: "Lista propostas de um empreendimento." })
  listLotProposals(
    @CurrentUser() auth: AuthContext,
    @Param("developmentId") developmentId: string
  ): Promise<any> {
    return this.proposals.listByDevelopment(auth, developmentId);
  }

  @Post("proposals")
  @ApiOperation({ summary: "Cria proposta de compra de lote." })
  createLotProposal(
    @CurrentUser() auth: AuthContext,
    @Body() dto: any
  ): Promise<any> {
    return this.proposals.create(auth, dto);
  }

  @Post("proposals/:id/approve")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "Aprova proposta de lote e cria venda." })
  approveLotProposal(
    @CurrentUser() auth: AuthContext,
    @Param("id") id: string,
    @Body() dto: any
  ): Promise<any> {
    return this.proposals.approve(auth, id, dto);
  }
}
