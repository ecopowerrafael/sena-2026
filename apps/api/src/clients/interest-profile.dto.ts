import { PropertyObjective } from "../generated/prisma/enums";

export class InterestProfileDto {
  id!: string;
  clientId!: string;
  objective!: PropertyObjective;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minSuites?: number;
  minParkingSpots?: number;
  paymentMethod?: string[];
  needsFinancing?: boolean;
  notes?: string;
  preferredNeighborhoods?: string;
  createdAt!: Date;
  updatedAt!: Date;
}

export class UpdateInterestProfileDto {
  objective?: PropertyObjective;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minSuites?: number;
  minParkingSpots?: number;
  paymentMethod?: string[];
  needsFinancing?: boolean;
  notes?: string;
  preferredNeighborhoods?: string;
}
