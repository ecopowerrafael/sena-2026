import { Module } from "@nestjs/common";
import { DevelopmentsService } from "./developments.service";
import { LotsService } from "./lots.service";
import { LotProposalsService } from "./proposals.service";
import { DevelopmentsController } from "./developments.controller";

@Module({
  providers: [DevelopmentsService, LotsService, LotProposalsService],
  controllers: [DevelopmentsController],
  exports: [DevelopmentsService, LotsService, LotProposalsService],
})
export class DevelopmentsModule {}
