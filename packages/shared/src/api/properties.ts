export interface PropertyDto {
  id: string;
  code: string;
  title: string;
  type: string;
  purpose: "SALE" | "RENT" | "BOTH";
  salePrice: number | null;
  rentalPrice: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parkingSpots: number | null;
  neighborhood: string;
  city: string;
  status: string;
  isExclusive: boolean;
  owners: { clientId: string; clientName: string; ownershipPercentage: number | null }[];
  mediaCount: number;
}

export interface InterestMatchResult {
  propertyId: string;
  score: number;
  reasons: string[];
}
