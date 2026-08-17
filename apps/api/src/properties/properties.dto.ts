import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsArray } from "class-validator";

export type PropertyType = "RESIDENTIAL_HOUSE" | "APARTMENT" | "PENTHOUSE" | "TOWNHOUSE" | "LOT";
export type PropertyPurpose = "SALE" | "RENT" | "BOTH";
export type PropertyStatus = "CAPTURING" | "AVAILABLE" | "RESERVED" | "NEGOTIATION" | "SOLD";
export type DocumentationStatus = "FULLY_REGULARIZED" | "IN_INVENTORY" | "HABITE_PENDING" | "FINANCEABLE";

export class PropertyDto {
  id!: string;
  tenantId!: string;
  code!: string;
  title!: string;
  type!: PropertyType;
  purpose!: PropertyPurpose;
  captatorBrokerId?: string;
  captatorBrokerName?: string;
  salePrice?: number;
  rentalPrice?: number;
  condoFee?: number;
  iptu?: number;
  addressLine!: string;
  number?: string;
  complement?: string;
  neighborhood!: string;
  city!: string;
  state!: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  totalArea?: number;
  privateArea?: number;
  bedrooms?: number;
  suites?: number;
  bathrooms?: number;
  parkingSpots?: number;
  documentationStatus!: DocumentationStatus;
  isExclusive!: boolean;
  exclusivityEndsAt?: Date;
  status!: PropertyStatus;
  owners?: Array<{ clientId: string; clientName: string; percentage?: number; isPrimary: boolean }>;
  createdAt!: Date;
  updatedAt!: Date;
}

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  type!: PropertyType;

  @IsString()
  @IsNotEmpty()
  purpose!: PropertyPurpose;

  @IsString()
  @IsOptional()
  captatorBrokerId?: string;

  @IsNumber()
  @IsOptional()
  salePrice?: number;

  @IsNumber()
  @IsOptional()
  rentalPrice?: number;

  @IsNumber()
  @IsOptional()
  condoFee?: number;

  @IsNumber()
  @IsOptional()
  iptu?: number;

  @IsString()
  @IsNotEmpty()
  addressLine!: string;

  @IsString()
  @IsOptional()
  number?: string;

  @IsString()
  @IsOptional()
  complement?: string;

  @IsString()
  @IsNotEmpty()
  neighborhood!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  state!: string;

  @IsString()
  @IsOptional()
  zipCode?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsNumber()
  @IsOptional()
  totalArea?: number;

  @IsNumber()
  @IsOptional()
  privateArea?: number;

  @IsNumber()
  @IsOptional()
  bedrooms?: number;

  @IsNumber()
  @IsOptional()
  suites?: number;

  @IsNumber()
  @IsOptional()
  bathrooms?: number;

  @IsNumber()
  @IsOptional()
  parkingSpots?: number;

  @IsBoolean()
  @IsOptional()
  isExclusive?: boolean;

  @IsArray()
  @IsOptional()
  owners?: Array<{ clientId: string; percentage?: number; isPrimary?: boolean }>;
}

export class UpdatePropertyDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  type?: PropertyType;

  @IsString()
  @IsOptional()
  purpose?: PropertyPurpose;

  @IsString()
  @IsOptional()
  captatorBrokerId?: string;

  @IsNumber()
  @IsOptional()
  salePrice?: number;

  @IsNumber()
  @IsOptional()
  rentalPrice?: number;

  @IsNumber()
  @IsOptional()
  condoFee?: number;

  @IsNumber()
  @IsOptional()
  iptu?: number;

  @IsString()
  @IsOptional()
  addressLine?: string;

  @IsString()
  @IsOptional()
  number?: string;

  @IsString()
  @IsOptional()
  complement?: string;

  @IsString()
  @IsOptional()
  neighborhood?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  zipCode?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsNumber()
  @IsOptional()
  totalArea?: number;

  @IsNumber()
  @IsOptional()
  privateArea?: number;

  @IsNumber()
  @IsOptional()
  bedrooms?: number;

  @IsNumber()
  @IsOptional()
  suites?: number;

  @IsNumber()
  @IsOptional()
  bathrooms?: number;

  @IsNumber()
  @IsOptional()
  parkingSpots?: number;

  @IsString()
  @IsOptional()
  documentationStatus?: DocumentationStatus;

  @IsBoolean()
  @IsOptional()
  isExclusive?: boolean;

  @IsOptional()
  exclusivityEndsAt?: Date;

  @IsString()
  @IsOptional()
  status?: PropertyStatus;
}
