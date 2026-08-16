import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import type { VisitDto } from "@sena/shared";
import type { AuthContext } from "../auth/auth.types";
import { CurrentUser, Roles } from "../auth/decorators";
import { CreateVisitDto, UpdateVisitDto } from "./sales.dto";
import { VisitsService } from "./visits.service";

@ApiTags("visits")
@Roles("ADMIN", "MANAGER", "BROKER")
@Controller("visits")
export class VisitsController {
  constructor(private readonly visits: VisitsService) {}

  @Get()
  @ApiOperation({ summary: "Lista visitas agendadas." })
  list(@CurrentUser() auth: AuthContext): Promise<VisitDto[]> {
    return this.visits.list(auth);
  }

  @Get(":id")
  @ApiOperation({ summary: "Detalha uma visita." })
  findOne(@CurrentUser() auth: AuthContext, @Param("id") id: string): Promise<VisitDto> {
    return this.visits.findById(auth, id);
  }

  @Post()
  @ApiOperation({ summary: "Agenda uma visita." })
  create(@CurrentUser() auth: AuthContext, @Body() dto: CreateVisitDto): Promise<VisitDto> {
    return this.visits.create(auth, dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Atualiza uma visita." })
  update(
    @CurrentUser() auth: AuthContext,
    @Param("id") id: string,
    @Body() dto: UpdateVisitDto
  ): Promise<VisitDto> {
    return this.visits.update(auth, id, dto);
  }
}
