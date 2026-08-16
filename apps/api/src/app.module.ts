import { Module, type MiddlewareConsumer, type NestModule } from "@nestjs/common";
import { RequestIdMiddleware } from "./common/request-id.middleware";
import { ConfigModule } from "./config/config.module";
import { PrismaModule } from "./database/prisma.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [ConfigModule, PrismaModule, HealthModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes("*");
  }
}
