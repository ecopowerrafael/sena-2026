import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import type { AuthContext } from "../auth/auth.types";

export interface PropertyMatch {
  property: {
    id: string;
    code: string;
    title: string;
    type: string;
    purpose: string;
    salePrice?: number;
    rentalPrice?: number;
    bedrooms?: number;
    suites?: number;
    bathrooms?: number;
    parkingSpots?: number;
    neighborhood: string;
    city: string;
    state: string;
  };
  score: number;
  reasons: string[];
}

@Injectable()
export class MatchingService {
  constructor(private readonly prisma: PrismaService) {}

  async findMatches(clientId: string, auth: AuthContext): Promise<PropertyMatch[]> {
    const profile = await this.prisma.interestProfile.findFirst({
      where: { clientId, tenantId: auth.tenantId },
    });

    if (!profile) throw new NotFoundException("Interest profile not found");

    const properties = await this.prisma.property.findMany({
      where: { tenantId: auth.tenantId },
      include: {
        owners: { include: { client: true } },
      },
    });

    const matches = properties
      .map(prop => this.calculateMatch(prop, profile))
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score);

    return matches;
  }

  private calculateMatch(property: any, profile: any): PropertyMatch {
    const reasons: string[] = [];
    let score = 0;

    // Verificar objetivo (BUY vs RENT)
    const profitableObjective = profile.objective === "BUY" ? "SALE" : "RENT";
    const hasRelevantPurpose = property.purpose === profitableObjective || property.purpose === "BOTH";
    if (hasRelevantPurpose) {
      score += 20;
      reasons.push(`Finalidade compatível: ${property.purpose}`);
    } else {
      return { property: this.mapProperty(property), score: 0, reasons: [] };
    }

    // Faixa de preço
    const relevantPrice =
      profile.objective === "BUY" ? property.salePrice : property.rentalPrice;
    if (relevantPrice) {
      const priceNumber = Number(relevantPrice);
      const minPrice = profile.minPrice ? Number(profile.minPrice) : undefined;
      const maxPrice = profile.maxPrice ? Number(profile.maxPrice) : undefined;

      if (!minPrice || !maxPrice) {
        score += 15;
        reasons.push(`Preço sem restrição: R$ ${priceNumber.toLocaleString("pt-BR")}`);
      } else if (priceNumber >= minPrice && priceNumber <= maxPrice) {
        score += 25;
        reasons.push(
          `Preço na faixa: R$ ${priceNumber.toLocaleString("pt-BR")} (${minPrice?.toLocaleString("pt-BR")} - ${maxPrice?.toLocaleString("pt-BR")})`
        );
      } else if (
        priceNumber > maxPrice &&
        priceNumber <= maxPrice * 1.1
      ) {
        score += 10;
        reasons.push(`Preço 10% acima do máximo: R$ ${priceNumber.toLocaleString("pt-BR")}`);
      } else {
        return { property: this.mapProperty(property), score: 0, reasons: [] };
      }
    }

    // Quartos
    if (profile.minBedrooms && property.bedrooms) {
      if (property.bedrooms >= profile.minBedrooms) {
        score += 15;
        reasons.push(`${property.bedrooms} quartos (mín: ${profile.minBedrooms})`);
      } else {
        return { property: this.mapProperty(property), score: 0, reasons: [] };
      }
    }

    // Suites
    if (profile.minSuites && property.suites) {
      if (property.suites >= profile.minSuites) {
        score += 10;
        reasons.push(`${property.suites} suites (mín: ${profile.minSuites})`);
      }
    }

    // Vagas de garagem
    if (profile.minParkingSpots && property.parkingSpots) {
      if (property.parkingSpots >= profile.minParkingSpots) {
        score += 10;
        reasons.push(`${property.parkingSpots} vagas (mín: ${profile.minParkingSpots})`);
      }
    }

    // Localização preferida
    if (profile.preferredNeighborhoods) {
      const neighborhoods = Array.isArray(profile.preferredNeighborhoods)
        ? profile.preferredNeighborhoods
        : profile.preferredNeighborhoods
            .split(/[,;]/)
            .map((n: string) => n.trim().toLowerCase());

      if (
        neighborhoods.some(
          (n: string) => property.neighborhood.toLowerCase().includes(n) ||
          n.includes(property.neighborhood.toLowerCase())
        )
      ) {
        score += 15;
        reasons.push(`Bairro preferido: ${property.neighborhood}`);
      }
    }

    // Bônus por tipo de imóvel
    if (property.type) {
      score += 5;
      reasons.push(`Tipo: ${property.type}`);
    }

    return {
      property: this.mapProperty(property),
      score,
      reasons,
    };
  }

  private mapProperty(property: any) {
    return {
      id: property.id,
      code: property.code,
      title: property.title,
      type: property.type,
      purpose: property.purpose,
      salePrice: property.salePrice ? Number(property.salePrice) : undefined,
      rentalPrice: property.rentalPrice ? Number(property.rentalPrice) : undefined,
      bedrooms: property.bedrooms,
      suites: property.suites,
      bathrooms: property.bathrooms,
      parkingSpots: property.parkingSpots,
      neighborhood: property.neighborhood,
      city: property.city,
      state: property.state,
    };
  }
}
