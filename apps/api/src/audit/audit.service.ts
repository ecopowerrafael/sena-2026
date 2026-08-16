import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

export interface AuditEntry {
  action: string;
  tenantId?: string | null;
  userId?: string | null;
  entity?: string | null;
  entityId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Auditoria de ações críticas (ARCHITECTURE.md §20).
 * Nunca registra senha, token ou hash — apenas identificadores e resultado.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(entry: AuditEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: entry.action,
          tenantId: entry.tenantId ?? null,
          userId: entry.userId ?? null,
          entity: entry.entity ?? null,
          entityId: entry.entityId ?? null,
          ip: entry.ip?.slice(0, 64) ?? null,
          userAgent: entry.userAgent?.slice(0, 512) ?? null,
          metadata: (entry.metadata ?? undefined) as never,
        },
      });
    } catch (error) {
      // Auditoria nunca deve derrubar a operação principal.
      this.logger.error(`Falha ao gravar auditoria "${entry.action}": ${(error as Error).message}`);
    }
  }
}
