import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import type { CommissionDto } from "@sena/shared";
import type { AuthContext } from "../auth/auth.types";
import { CurrentUser, Roles } from "../auth/decorators";
import { CommissionsService } from "./commissions.service";

@ApiTags("commissions")
@Roles("ADMIN", "MANAGER", "BROKER")
@Controller("commissions")
export class CommissionsController {
  constructor(private readonly commissions: CommissionsService) {}

  @Get()
  @ApiOperation({ summary: "Lista comissões." })
  list(@CurrentUser() auth: AuthContext): Promise<CommissionDto[]> {
    return this.commissions.list(auth);
  }

  @Get(":id")
  @ApiOperation({ summary: "Detalha uma comissão." })
  findOne(@CurrentUser() auth: AuthContext, @Param("id") id: string): Promise<CommissionDto> {
    return this.commissions.findById(auth, id);
  }

  @Get("by-sale/:saleId")
  @ApiOperation({ summary: "Obtém comissão de uma venda." })
  getBySale(
    @CurrentUser() auth: AuthContext,
    @Param("saleId") saleId: string
  ): Promise<CommissionDto | null> {
    return this.commissions.getBySaleId(auth, saleId);
  }
}
