import { Controller, Get, Patch, Param, Body } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators";
import type { AuthContext } from "../auth/auth.types";
import { InterestProfileService } from "./interest-profile.service";
import { InterestProfileDto, UpdateInterestProfileDto } from "./interest-profile.dto";

@Controller("api/v1/clients/:clientId/interest-profile")
export class InterestProfileController {
  constructor(private readonly service: InterestProfileService) {}

  @Get()
  async getInterestProfile(
    @Param("clientId") clientId: string,
    @CurrentUser() auth: AuthContext
  ): Promise<{ data: InterestProfileDto }> {
    const data = await this.service.findByClientId(clientId, auth);
    return { data };
  }

  @Patch()
  async updateInterestProfile(
    @Param("clientId") clientId: string,
    @Body() dto: UpdateInterestProfileDto,
    @CurrentUser() auth: AuthContext
  ): Promise<{ data: InterestProfileDto }> {
    const data = await this.service.createOrUpdate(clientId, dto, auth);
    return { data };
  }
}
