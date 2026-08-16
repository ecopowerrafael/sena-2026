import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import type { AuthContext } from "../auth/auth.types";
import { CurrentUser, Roles } from "../auth/decorators";
import { CreateUserDto, UpdateUserStatusDto } from "./users.dto";
import { UsersService, type UserView } from "./users.service";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "Lista os usuários da imobiliária autenticada." })
  list(@CurrentUser() auth: AuthContext): Promise<UserView[]> {
    return this.users.list(auth);
  }

  @Get(":id")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "Detalha um usuário do próprio tenant." })
  findOne(@CurrentUser() auth: AuthContext, @Param("id") id: string): Promise<UserView> {
    return this.users.findById(auth, id);
  }

  @Post()
  @Roles("ADMIN")
  @ApiOperation({ summary: "Cria usuário no tenant autenticado." })
  create(@CurrentUser() auth: AuthContext, @Body() dto: CreateUserDto): Promise<UserView> {
    return this.users.create(auth, dto);
  }

  @Patch(":id/status")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Ativa ou desativa o acesso de um usuário." })
  setStatus(
    @CurrentUser() auth: AuthContext,
    @Param("id") id: string,
    @Body() dto: UpdateUserStatusDto
  ): Promise<UserView> {
    return this.users.setStatus(auth, id, dto.status);
  }
}
