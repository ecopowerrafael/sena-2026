import { Module } from "@nestjs/common";
import { LeasesService } from "./leases.service";
import { ChargesService } from "./charges.service";
import { InspectionsService } from "./inspections.service";
import { MaintenanceService } from "./maintenance.service";

@Module({
  providers: [LeasesService, ChargesService, InspectionsService, MaintenanceService],
  exports: [LeasesService, ChargesService, InspectionsService, MaintenanceService],
})
export class RentalsModule {}
