import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import type { SaleDto } from "@sena/shared";
import type { AuthContext } from "../auth/auth.types";
import { CurrentUser, Roles } from "../auth/decorators";
import { UpdateSaleDto } from "./sales.dto";
import { SalesService } from "./sales.service";

@ApiTags("sales")
@Roles("ADMIN", "MANAGER", "BROKER")
@Controller("sales")
export class SalesController {
  constructor(private readonly sales: SalesService) {}

  @Get()
  @ApiOperation({ summary: "Lista vendas." })
  list(@CurrentUser() auth: AuthContext): Promise<SaleDto[]> {
    return this.sales.list(auth);
  }

  @Get(":id")
  @ApiOperation({ summary: "Detalha uma venda." })
  findOne(@CurrentUser() auth: AuthContext, @Param("id") id: string): Promise<SaleDto> {
    return this.sales.findById(auth, id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Atualiza status ou dados de uma venda." })
  update(
    @CurrentUser() auth: AuthContext,
    @Param("id") id: string,
    @Body() dto: UpdateSaleDto
  ): Promise<SaleDto> {
    return this.sales.update(auth, id, dto);
  }
}
