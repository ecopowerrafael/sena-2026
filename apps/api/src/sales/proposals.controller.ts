import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import type { ProposalDto, SaleDto } from "@sena/shared";
import type { AuthContext } from "../auth/auth.types";
import { CurrentUser, Roles } from "../auth/decorators";
import { CreateProposalDto, UpdateProposalDto, ApproveProposalDto } from "./sales.dto";
import { ProposalsService } from "./proposals.service";

@ApiTags("proposals")
@Roles("ADMIN", "MANAGER", "BROKER")
@Controller("proposals")
export class ProposalsController {
  constructor(private readonly proposals: ProposalsService) {}

  @Get()
  @ApiOperation({ summary: "Lista propostas." })
  list(@CurrentUser() auth: AuthContext): Promise<ProposalDto[]> {
    return this.proposals.list(auth);
  }

  @Get(":id")
  @ApiOperation({ summary: "Detalha uma proposta." })
  findOne(@CurrentUser() auth: AuthContext, @Param("id") id: string): Promise<ProposalDto> {
    return this.proposals.findById(auth, id);
  }

  @Post()
  @ApiOperation({ summary: "Cria uma proposta." })
  create(@CurrentUser() auth: AuthContext, @Body() dto: CreateProposalDto): Promise<ProposalDto> {
    return this.proposals.create(auth, dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Atualiza uma proposta." })
  update(
    @CurrentUser() auth: AuthContext,
    @Param("id") id: string,
    @Body() dto: UpdateProposalDto
  ): Promise<ProposalDto> {
    return this.proposals.update(auth, id, dto);
  }

  @Post(":id/approve")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "Aprova proposta e cria venda com comissão (transação atômica)." })
  approve(
    @CurrentUser() auth: AuthContext,
    @Param("id") id: string,
    @Body() dto: ApproveProposalDto
  ): Promise<SaleDto> {
    return this.proposals.approve(auth, id, dto);
  }
}
