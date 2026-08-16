import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import type { BrokerDto } from "@sena/shared";
import type { AuthContext } from "../auth/auth.types";
import { CurrentUser, Roles } from "../auth/decorators";
import { CreateBrokerDto, UpdateBrokerDto } from "./brokers.dto";
import { BrokersService } from "./brokers.service";

@ApiTags("brokers")
@Roles("ADMIN", "MANAGER")
@Controller("brokers")
export class BrokersController {
  constructor(private readonly brokers: BrokersService) {}

  @Get()
  @ApiOperation({ summary: "Lista corretores da imobiliária." })
  list(@CurrentUser() auth: AuthContext): Promise<BrokerDto[]> {
    return this.brokers.list(auth);
  }

  @Get(":id")
  @ApiOperation({ summary: "Detalha um corretor." })
  findOne(@CurrentUser() auth: AuthContext, @Param("id") id: string): Promise<BrokerDto> {
    return this.brokers.findById(auth, id);
  }

  @Post()
  @Roles("ADMIN")
  @ApiOperation({ summary: "Cadastra um novo corretor." })
  create(@CurrentUser() auth: AuthContext, @Body() dto: CreateBrokerDto): Promise<BrokerDto> {
    return this.brokers.create(auth, dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Atualiza dados de um corretor." })
  update(
    @CurrentUser() auth: AuthContext,
    @Param("id") id: string,
    @Body() dto: UpdateBrokerDto
  ): Promise<BrokerDto> {
    return this.brokers.update(auth, id, dto);
  }
}
