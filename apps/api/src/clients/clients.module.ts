import { Module } from "@nestjs/common";
import { ClientsController } from "./clients.controller";
import { ClientsService } from "./clients.service";
import { InterestProfileController } from "./interest-profile.controller";
import { InterestProfileService } from "./interest-profile.service";
import { MatchingController } from "./matching.controller";
import { MatchingService } from "./matching.service";

@Module({
  controllers: [ClientsController, InterestProfileController, MatchingController],
  providers: [ClientsService, InterestProfileService, MatchingService],
  exports: [ClientsService, InterestProfileService, MatchingService],
})
export class ClientsModule {}
