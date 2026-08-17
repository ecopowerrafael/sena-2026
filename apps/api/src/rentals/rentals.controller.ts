import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import type { LeaseDto, RentChargeDto, OwnerPayoutDto } from "@sena/shared";
import type { AuthContext } from "../auth/auth.types";
import { CurrentUser, Roles } from "../auth/decorators";
import { ChargesService } from "./charges.service";
import { InspectionsService } from "./inspections.service";
import { LeasesService } from "./leases.service";
import { MaintenanceService } from "./maintenance.service";
import {
  CreateLeaseDto,
  UpdateLeaseDto,
  AddLeaseTenantDto,
  AddLeaseOwnerDto,
  CreateRentChargeDto,
  CreateRentPaymentDto,
  AddRentalExpenseDto,
} from "./rentals.dto";

@ApiTags("rentals")
@Roles("ADMIN", "MANAGER", "BROKER")
@Controller("rentals")
export class RentalsController {
  constructor(
    private readonly leases: LeasesService,
    private readonly charges: ChargesService,
    private readonly inspections: InspectionsService,
    private readonly maintenance: MaintenanceService
  ) {}

  // ===== LEASES =====

  @Get("leases")
  @ApiOperation({ summary: "Lista contratos de locação." })
  listLeases(@CurrentUser() auth: AuthContext): Promise<LeaseDto[]> {
    return this.leases.list(auth);
  }

  @Get("leases/:id")
  @ApiOperation({ summary: "Detalha um contrato de locação." })
  findLease(
    @CurrentUser() auth: AuthContext,
    @Param("id") id: string
  ): Promise<LeaseDto> {
    return this.leases.findById(auth, id);
  }

  @Post("leases")
  @ApiOperation({ summary: "Cria um contrato de locação." })
  createLease(
    @CurrentUser() auth: AuthContext,
    @Body() dto: CreateLeaseDto
  ): Promise<LeaseDto> {
    return this.leases.create(auth, dto);
  }

  @Patch("leases/:id")
  @ApiOperation({ summary: "Atualiza um contrato de locação." })
  updateLease(
    @CurrentUser() auth: AuthContext,
    @Param("id") id: string,
    @Body() dto: UpdateLeaseDto
  ): Promise<LeaseDto> {
    return this.leases.update(auth, id, dto);
  }

  @Post("leases/:id/tenants")
  @ApiOperation({ summary: "Adiciona locatário ao contrato." })
  addTenant(
    @CurrentUser() auth: AuthContext,
    @Param("id") leaseId: string,
    @Body() dto: AddLeaseTenantDto
  ): Promise<void> {
    return this.leases.addTenant(auth, leaseId, dto);
  }

  @Post("leases/:id/owners")
  @ApiOperation({ summary: "Adiciona proprietário ao contrato." })
  addOwner(
    @CurrentUser() auth: AuthContext,
    @Param("id") leaseId: string,
    @Body() dto: AddLeaseOwnerDto
  ): Promise<void> {
    return this.leases.addOwner(auth, leaseId, dto);
  }

  // ===== CHARGES =====

  @Get("leases/:leaseId/charges")
  @ApiOperation({ summary: "Lista cobranças de um contrato." })
  listCharges(
    @CurrentUser() auth: AuthContext,
    @Param("leaseId") leaseId: string
  ): Promise<RentChargeDto[]> {
    return this.charges.listCharges(auth, leaseId);
  }

  @Post("charges")
  @ApiOperation({ summary: "Gera cobrança de aluguel." })
  createCharge(
    @CurrentUser() auth: AuthContext,
    @Body() dto: CreateRentChargeDto
  ): Promise<RentChargeDto> {
    return this.charges.createCharge(auth, dto);
  }

  @Post("charges/payments")
  @ApiOperation({ summary: "Registra pagamento de cobrança." })
  recordPayment(
    @CurrentUser() auth: AuthContext,
    @Body() dto: CreateRentPaymentDto
  ): Promise<void> {
    return this.charges.recordPayment(auth, dto);
  }

  @Post("charges/expenses")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "Adiciona despesa autorizada ao contrato." })
  addExpense(
    @CurrentUser() auth: AuthContext,
    @Body() dto: AddRentalExpenseDto
  ): Promise<void> {
    return this.charges.addExpense(auth, dto);
  }

  @Get("leases/:leaseId/payouts")
  @ApiOperation({ summary: "Lista repasses aos proprietários." })
  listPayouts(
    @CurrentUser() auth: AuthContext,
    @Param("leaseId") leaseId: string
  ): Promise<OwnerPayoutDto[]> {
    return this.charges.listPayouts(auth, leaseId);
  }

  // ===== INSPECTIONS =====

  @Get("leases/:leaseId/inspections")
  @ApiOperation({ summary: "Lista vistorias de um contrato." })
  listInspections(
    @CurrentUser() auth: AuthContext,
    @Param("leaseId") leaseId: string
  ): Promise<any> {
    return this.inspections.listByLease(auth, leaseId);
  }

  @Post("inspections")
  @ApiOperation({ summary: "Cria vistoria." })
  createInspection(@CurrentUser() auth: AuthContext, @Body() dto: any): Promise<any> {
    return this.inspections.create(auth, dto);
  }

  // ===== MAINTENANCE =====

  @Get("leases/:leaseId/maintenance")
  @ApiOperation({ summary: "Lista solicitações de manutenção de um contrato." })
  listMaintenance(
    @CurrentUser() auth: AuthContext,
    @Param("leaseId") leaseId: string
  ): Promise<any> {
    return this.maintenance.listRequests(auth, leaseId);
  }

  @Post("maintenance/requests")
  @ApiOperation({ summary: "Cria solicitação de manutenção." })
  createMaintenance(@CurrentUser() auth: AuthContext, @Body() dto: any): Promise<any> {
    return this.maintenance.createRequest(auth, dto);
  }
}
