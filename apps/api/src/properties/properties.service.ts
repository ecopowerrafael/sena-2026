import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import type { AuthContext } from "../auth/auth.types";
import { PropertyDto, CreatePropertyDto, UpdatePropertyDto } from "./properties.dto";

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(auth: AuthContext): Promise<PropertyDto[]> {
    const properties = await this.prisma.property.findMany({
      where: { tenantId: auth.tenantId },
      include: {
        captatorBroker: { select: { name: true } },
        owners: { include: { client: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    return properties.map(p => this.mapPropertyDto(p));
  }

  async findOne(id: string, auth: AuthContext): Promise<PropertyDto> {
    const property = await this.prisma.property.findFirst({
      where: { id, tenantId: auth.tenantId },
      include: {
        captatorBroker: { select: { name: true } },
        owners: { include: { client: { select: { name: true } } } },
      },
    });

    if (!property) throw new NotFoundException("Property not found");
    return this.mapPropertyDto(property);
  }

  async create(data: CreatePropertyDto, auth: AuthContext): Promise<PropertyDto> {
    const property = await this.prisma.property.create({
      data: {
        tenantId: auth.tenantId,
        code: data.code,
        title: data.title,
        type: data.type,
        purpose: data.purpose,
        captatorBrokerId: data.captatorBrokerId,
        salePrice: data.salePrice,
        rentalPrice: data.rentalPrice,
        condoFee: data.condoFee,
        iptu: data.iptu,
        addressLine: data.addressLine,
        number: data.number,
        complement: data.complement,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        latitude: data.latitude,
        longitude: data.longitude,
        totalArea: data.totalArea,
        privateArea: data.privateArea,
        bedrooms: data.bedrooms,
        suites: data.suites,
        bathrooms: data.bathrooms,
        parkingSpots: data.parkingSpots,
        isExclusive: data.isExclusive ?? false,
        owners: {
          create: data.owners?.map(o => ({
            tenantId: auth.tenantId,
            clientId: o.clientId,
            ownershipPercentage: o.percentage,
            isPrimary: o.isPrimary ?? false,
          })) || [],
        },
      },
      include: {
        captatorBroker: { select: { name: true } },
        owners: { include: { client: { select: { name: true } } } },
      },
    });

    return this.mapPropertyDto(property);
  }

  async update(id: string, data: UpdatePropertyDto, auth: AuthContext): Promise<PropertyDto> {
    const property = await this.prisma.property.findFirst({
      where: { id, tenantId: auth.tenantId },
    });

    if (!property) throw new NotFoundException("Property not found");

    const updated = await this.prisma.property.update({
      where: { id },
      data: {
        title: data.title,
        type: data.type,
        purpose: data.purpose,
        captatorBrokerId: data.captatorBrokerId,
        salePrice: data.salePrice,
        rentalPrice: data.rentalPrice,
        condoFee: data.condoFee,
        iptu: data.iptu,
        addressLine: data.addressLine,
        number: data.number,
        complement: data.complement,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        latitude: data.latitude,
        longitude: data.longitude,
        totalArea: data.totalArea,
        privateArea: data.privateArea,
        bedrooms: data.bedrooms,
        suites: data.suites,
        bathrooms: data.bathrooms,
        parkingSpots: data.parkingSpots,
        documentationStatus: data.documentationStatus,
        isExclusive: data.isExclusive,
        exclusivityEndsAt: data.exclusivityEndsAt,
        status: data.status,
      },
      include: {
        captatorBroker: { select: { name: true } },
        owners: { include: { client: { select: { name: true } } } },
      },
    });

    return this.mapPropertyDto(updated);
  }

  async delete(id: string, auth: AuthContext): Promise<void> {
    const property = await this.prisma.property.findFirst({
      where: { id, tenantId: auth.tenantId },
    });

    if (!property) throw new NotFoundException("Property not found");

    await this.prisma.property.delete({ where: { id } });
  }

  private mapPropertyDto(property: any): PropertyDto {
    return {
      id: property.id,
      tenantId: property.tenantId,
      code: property.code,
      title: property.title,
      type: property.type,
      purpose: property.purpose,
      captatorBrokerId: property.captatorBrokerId,
      captatorBrokerName: property.captatorBroker?.name,
      salePrice: property.salePrice ? Number(property.salePrice) : undefined,
      rentalPrice: property.rentalPrice ? Number(property.rentalPrice) : undefined,
      condoFee: property.condoFee ? Number(property.condoFee) : undefined,
      iptu: property.iptu ? Number(property.iptu) : undefined,
      addressLine: property.addressLine,
      number: property.number,
      complement: property.complement,
      neighborhood: property.neighborhood,
      city: property.city,
      state: property.state,
      zipCode: property.zipCode,
      latitude: property.latitude ? Number(property.latitude) : undefined,
      longitude: property.longitude ? Number(property.longitude) : undefined,
      totalArea: property.totalArea ? Number(property.totalArea) : undefined,
      privateArea: property.privateArea ? Number(property.privateArea) : undefined,
      bedrooms: property.bedrooms,
      suites: property.suites,
      bathrooms: property.bathrooms,
      parkingSpots: property.parkingSpots,
      documentationStatus: property.documentationStatus,
      isExclusive: property.isExclusive,
      exclusivityEndsAt: property.exclusivityEndsAt,
      status: property.status,
      owners: property.owners?.map((o: any) => ({
        clientId: o.clientId,
        clientName: o.client.name,
        percentage: o.ownershipPercentage,
        isPrimary: o.isPrimary,
      })),
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
    };
  }
}
