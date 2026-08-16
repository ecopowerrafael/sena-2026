import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import type {
  ActivityDto,
  ApiListMeta,
  CampaignDto,
  LeadDto,
  LeadOriginDto,
  LeadStatusHistoryDto,
} from "@sena/shared";
import type { AuthContext } from "../auth/auth.types";
import { CurrentUser, Roles } from "../auth/decorators";
import {
  ChangeLeadStatusDto,
  CreateActivityDto,
  CreateCampaignDto,
  CreateLeadDto,
  CreateLeadOriginDto,
  ListLeadsQueryDto,
  UpdateLeadDto,
} from "./leads.dto";
import { LeadsService } from "./leads.service";
import { OriginsService } from "./origins.service";

@ApiTags("leads")
@Controller("leads")
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Get()
  @ApiOperation({ summary: "Lista leads do funil, com filtros e paginação." })
  list(
    @CurrentUser() auth: AuthContext,
    @Query() query: ListLeadsQueryDto
  ): Promise<{ data: LeadDto[]; meta: ApiListMeta }> {
    return this.leads.list(auth, query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Detalha um lead." })
  findOne(@CurrentUser() auth: AuthContext, @Param("id") id: string): Promise<LeadDto> {
    return this.leads.findById(auth, id);
  }

  @Post()
  @ApiOperation({ summary: "Cria um lead (cliente existente ou novo)." })
  create(@CurrentUser() auth: AuthContext, @Body() dto: CreateLeadDto): Promise<LeadDto> {
    return this.leads.create(auth, dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Atualiza dados do lead." })
  update(
    @CurrentUser() auth: AuthContext,
    @Param("id") id: string,
    @Body() dto: UpdateLeadDto
  ): Promise<LeadDto> {
    return this.leads.update(auth, id, dto);
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Move o lead no funil (LOST exige motivo)." })
  changeStatus(
    @CurrentUser() auth: AuthContext,
    @Param("id") id: string,
    @Body() dto: ChangeLeadStatusDto
  ): Promise<LeadDto> {
    return this.leads.changeStatus(auth, id, dto);
  }

  @Get(":id/history")
  @ApiOperation({ summary: "Histórico de estágios do lead." })
  history(
    @CurrentUser() auth: AuthContext,
    @Param("id") id: string
  ): Promise<LeadStatusHistoryDto[]> {
    return this.leads.history(auth, id);
  }

  @Get(":id/activities")
  @ApiOperation({ summary: "Atividades registradas no lead." })
  activities(@CurrentUser() auth: AuthContext, @Param("id") id: string): Promise<ActivityDto[]> {
    return this.leads.listActivities(auth, id);
  }

  @Post(":id/activities")
  @ApiOperation({ summary: "Registra um contato/atividade no lead." })
  addActivity(
    @CurrentUser() auth: AuthContext,
    @Param("id") id: string,
    @Body() dto: CreateActivityDto
  ): Promise<ActivityDto> {
    return this.leads.addActivity(auth, id, dto);
  }
}

@ApiTags("leads")
@Controller("lead-origins")
export class LeadOriginsController {
  constructor(private readonly origins: OriginsService) {}

  @Get()
  @ApiOperation({ summary: "Origens de captação do tenant." })
  list(@CurrentUser() auth: AuthContext): Promise<LeadOriginDto[]> {
    return this.origins.list(auth);
  }

  @Post()
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "Cria uma origem de captação." })
  create(
    @CurrentUser() auth: AuthContext,
    @Body() dto: CreateLeadOriginDto
  ): Promise<LeadOriginDto> {
    return this.origins.create(auth, dto);
  }
}

@ApiTags("leads")
@Controller("campaigns")
export class CampaignsController {
  constructor(private readonly origins: OriginsService) {}

  @Get()
  @ApiOperation({ summary: "Campanhas do tenant." })
  list(@CurrentUser() auth: AuthContext): Promise<CampaignDto[]> {
    return this.origins.listCampaigns(auth);
  }

  @Post()
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "Cria uma campanha." })
  create(@CurrentUser() auth: AuthContext, @Body() dto: CreateCampaignDto): Promise<CampaignDto> {
    return this.origins.createCampaign(auth, dto);
  }
}
