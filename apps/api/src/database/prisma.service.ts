import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";
import { env } from "../config/env";

/**
 * No Prisma 7 a conexão é fornecida por driver adapter; MySQL 8 usa o adapter MariaDB.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({ adapter: new PrismaMariaDb(env().DATABASE_URL) });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log("Conexão com MySQL estabelecida.");
    } catch (error) {
      // A API sobe mesmo sem banco: /health continua respondendo e /ready acusa o problema.
      this.logger.error(`Falha ao conectar no MySQL: ${(error as Error).message}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /** Ping usado por /ready. */
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.warn(`Banco indisponível: ${(error as Error).message}`);
      return false;
    }
  }
}
