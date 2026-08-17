import { Controller, Get, Param } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators";
import type { AuthContext } from "../auth/auth.types";
import { MatchingService, type PropertyMatch } from "./matching.service";

@Controller("api/v1/clients/:clientId/matches")
export class MatchingController {
  constructor(private readonly service: MatchingService) {}

  @Get()
  async getMatches(
    @Param("clientId") clientId: string,
    @CurrentUser() auth: AuthContext
  ): Promise<{ data: PropertyMatch[] }> {
    const data = await this.service.findMatches(clientId, auth);
    return { data };
  }
}
