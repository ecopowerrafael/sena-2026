import { Module } from "@nestjs/common";
import { ClientsModule } from "../clients/clients.module";
import { CampaignsController, LeadOriginsController, LeadsController } from "./leads.controller";
import { LeadsService } from "./leads.service";
import { OriginsService } from "./origins.service";

@Module({
  imports: [ClientsModule],
  controllers: [LeadsController, LeadOriginsController, CampaignsController],
  providers: [LeadsService, OriginsService],
})
export class LeadsModule {}
