import { Controller, Get, Post, Patch, Delete, Param, Body } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators";
import type { AuthContext } from "../auth/auth.types";
import { PropertiesService } from "./properties.service";
import { PropertyDto, CreatePropertyDto, UpdatePropertyDto } from "./properties.dto";

@Controller("properties")
export class PropertiesController {
  constructor(private readonly service: PropertiesService) {}

  @Get()
  async findAll(@CurrentUser() auth: AuthContext): Promise<{ data: PropertyDto[] }> {
    const data = await this.service.findAll(auth);
    return { data };
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @CurrentUser() auth: AuthContext): Promise<{ data: PropertyDto }> {
    const data = await this.service.findOne(id, auth);
    return { data };
  }

  @Post()
  async create(@Body() dto: CreatePropertyDto, @CurrentUser() auth: AuthContext): Promise<{ data: PropertyDto }> {
    const data = await this.service.create(dto, auth);
    return { data };
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdatePropertyDto, @CurrentUser() auth: AuthContext): Promise<{ data: PropertyDto }> {
    const data = await this.service.update(id, dto, auth);
    return { data };
  }

  @Delete(":id")
  async delete(@Param("id") id: string, @CurrentUser() auth: AuthContext): Promise<{ data: null }> {
    await this.service.delete(id, auth);
    return { data: null };
  }
}
