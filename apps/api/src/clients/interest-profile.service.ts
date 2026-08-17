import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import type { AuthContext } from "../auth/auth.types";
import { InterestProfileDto, UpdateInterestProfileDto } from "./interest-profile.dto";

@Injectable()
export class InterestProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async findByClientId(clientId: string, auth: AuthContext): Promise<InterestProfileDto> {
    const profile = await this.prisma.interestProfile.findFirst({
      where: { clientId, tenantId: auth.tenantId },
    });

    if (!profile) throw new NotFoundException("Interest profile not found");
    return this.mapInterestProfileDto(profile);
  }

  async createOrUpdate(
    clientId: string,
    data: UpdateInterestProfileDto,
    auth: AuthContext
  ): Promise<InterestProfileDto> {
    // Verify client exists and belongs to tenant
    const client = await this.prisma.client.findFirst({
      where: { id: clientId, tenantId: auth.tenantId },
    });

    if (!client) throw new NotFoundException("Client not found");

    // Check if profile exists
    const existing = await this.prisma.interestProfile.findFirst({
      where: { clientId, tenantId: auth.tenantId },
    });

    const profile = existing
      ? await this.prisma.interestProfile.update({
          where: { id: existing.id },
          data: {
            objective: data.objective,
            minPrice: data.minPrice,
            maxPrice: data.maxPrice,
            minBedrooms: data.minBedrooms,
            minSuites: data.minSuites,
            minParkingSpots: data.minParkingSpots,
            paymentMethod: data.paymentMethod ? JSON.stringify(data.paymentMethod) : undefined,
            needsFinancing: data.needsFinancing,
            notes: data.notes,
            preferredNeighborhoods: data.preferredNeighborhoods,
          },
        })
      : await this.prisma.interestProfile.create({
          data: {
            tenantId: auth.tenantId,
            clientId,
            objective: data.objective || "BUY",
            minPrice: data.minPrice,
            maxPrice: data.maxPrice,
            minBedrooms: data.minBedrooms,
            minSuites: data.minSuites,
            minParkingSpots: data.minParkingSpots,
            paymentMethod: data.paymentMethod ? JSON.stringify(data.paymentMethod) : JSON.stringify([]),
            needsFinancing: data.needsFinancing ?? false,
            notes: data.notes,
            preferredNeighborhoods: data.preferredNeighborhoods,
          },
        });

    return this.mapInterestProfileDto(profile);
  }

  private mapInterestProfileDto(profile: any): InterestProfileDto {
    return {
      id: profile.id,
      clientId: profile.clientId,
      objective: profile.objective,
      minPrice: profile.minPrice ? Number(profile.minPrice) : undefined,
      maxPrice: profile.maxPrice ? Number(profile.maxPrice) : undefined,
      minBedrooms: profile.minBedrooms,
      minSuites: profile.minSuites,
      minParkingSpots: profile.minParkingSpots,
      paymentMethod: typeof profile.paymentMethod === "string"
        ? JSON.parse(profile.paymentMethod)
        : profile.paymentMethod,
      needsFinancing: profile.needsFinancing,
      notes: profile.notes,
      preferredNeighborhoods: profile.preferredNeighborhoods,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
