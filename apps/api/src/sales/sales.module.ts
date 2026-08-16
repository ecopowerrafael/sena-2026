import { Module } from "@nestjs/common";
import { VisitsController } from "./visits.controller";
import { VisitsService } from "./visits.service";
import { ProposalsController } from "./proposals.controller";
import { ProposalsService } from "./proposals.service";
import { SalesController } from "./sales.controller";
import { SalesService } from "./sales.service";
import { CommissionsController } from "./commissions.controller";
import { CommissionsService } from "./commissions.service";

@Module({
  controllers: [VisitsController, ProposalsController, SalesController, CommissionsController],
  providers: [VisitsService, ProposalsService, SalesService, CommissionsService],
  exports: [VisitsService, ProposalsService, SalesService, CommissionsService],
})
export class SalesModule {}
