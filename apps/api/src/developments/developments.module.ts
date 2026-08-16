import { Module } from "@nestjs/common";
import { DevelopmentsService } from "./developments.service";
import { LotsService } from "./lots.service";
import { LotProposalsService } from "./proposals.service";

@Module({
  providers: [DevelopmentsService, LotsService, LotProposalsService],
  exports: [DevelopmentsService, LotsService, LotProposalsService],
})
export class DevelopmentsModule {}
