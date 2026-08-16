import { Module, type MiddlewareConsumer, type NestModule } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AuditModule } from "./audit/audit.module";
import { AuthModule } from "./auth/auth.module";
import { CsrfGuard } from "./auth/csrf.guard";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { RolesGuard } from "./auth/roles.guard";
import { RequestIdMiddleware } from "./common/request-id.middleware";
import { ENV, ConfigModule } from "./config/config.module";
import type { Env } from "./config/env";
import { PrismaModule } from "./database/prisma.module";
import { HealthModule } from "./health/health.module";
import { UsersModule } from "./users/users.module";
import { ClientsModule } from "./clients/clients.module";
import { LeadsModule } from "./leads/leads.module";
import { BrokersModule } from "./brokers/brokers.module";
import { CryptoModule } from "./common/crypto.module";
import { SalesModule } from "./sales/sales.module";
import { RentalsModule } from "./rentals/rentals.module";
import { DevelopmentsModule } from "./developments/developments.module";

@Module({
  imports: [
    ConfigModule,
    ThrottlerModule.forRootAsync({
      inject: [ENV],
      useFactory: (env: Env) => ({
        throttlers: [
          { name: "default", limit: 120, ttl: 60_000 },
          {
            name: "login",
            limit: env.LOGIN_RATE_LIMIT,
            ttl: env.LOGIN_RATE_WINDOW_SECONDS * 1000,
          },
        ],
      }),
    }),
    PrismaModule,
    CryptoModule,
    AuditModule,
    AuthModule,
    UsersModule,
    HealthModule,
    ClientsModule,
    LeadsModule,
    BrokersModule,
    SalesModule,
    RentalsModule,
    DevelopmentsModule,
  ],
  providers: [
    // Ordem importa: rate limit → sessão → CSRF → papel.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: CsrfGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes("*");
  }
}
