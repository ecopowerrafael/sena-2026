import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import type { ApiListMeta, ClientDto } from "@sena/shared";
import type { AuthContext } from "../auth/auth.types";
import { CurrentUser, Roles } from "../auth/decorators";
import { CreateClientDto, ListClientsQueryDto, UpdateClientDto } from "./clients.dto";
import { ClientsService } from "./clients.service";

@ApiTags("clients")
@Controller("clients")
export class ClientsController {
  constructor(private readonly clients: ClientsService) {}

  @Get()
  @ApiOperation({ summary: "Lista clientes do tenant, paginado e filtrável." })
  list(
    @CurrentUser() auth: AuthContext,
    @Query() query: ListClientsQueryDto
  ): Promise<{ data: ClientDto[]; meta: ApiListMeta }> {
    return this.clients.list(auth, query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Detalha um cliente." })
  findOne(@CurrentUser() auth: AuthContext, @Param("id") id: string): Promise<ClientDto> {
    return this.clients.findById(auth, id);
  }

  @Post()
  @ApiOperation({ summary: "Cadastra um cliente (papéis múltiplos)." })
  create(@CurrentUser() auth: AuthContext, @Body() dto: CreateClientDto): Promise<ClientDto> {
    return this.clients.create(auth, dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Atualiza um cliente." })
  update(
    @CurrentUser() auth: AuthContext,
    @Param("id") id: string,
    @Body() dto: UpdateClientDto
  ): Promise<ClientDto> {
    return this.clients.update(auth, id, dto);
  }

  @Delete(":id")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "Arquiva um cliente (exclusão lógica)." })
  archive(
    @CurrentUser() auth: AuthContext,
    @Param("id") id: string
  ): Promise<{ id: string; archived: true }> {
    return this.clients.archive(auth, id);
  }
}
