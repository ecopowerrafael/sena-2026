import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import type { AuthContext } from "../auth/auth.types";
import type { DashboardMetricsDto, BrokerReportDto, VGVReportDto } from "@sena/shared";

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardMetrics(auth: AuthContext): Promise<DashboardMetricsDto> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Queries paralelas para performance
    const [
      leadStats,
      clientStats,
      propertyStats,
      saleStats,
      leaseStats,
      commissionStats,
      contractStats,
      rentChargeStats,
      brokerRanking,
      originRanking,
    ] = await Promise.all([
      this.getLeadStats(auth.tenantId, monthStart),
      this.getClientStats(auth.tenantId, monthStart),
      this.getPropertyStats(auth.tenantId),
      this.getSaleStats(auth.tenantId, monthStart),
      this.getLeaseStats(auth.tenantId),
      this.getCommissionStats(auth.tenantId),
      this.getContractStats(auth.tenantId),
      this.getRentChargeStats(auth.tenantId),
      this.getBrokerRanking(auth.tenantId),
      this.getOriginRanking(auth.tenantId),
    ]);

    return {
      leads: leadStats,
      clients: clientStats,
      properties: propertyStats,
      sales: saleStats,
      leases: leaseStats,
      vgv: { total: saleStats.totalAmount, thisMonth: saleStats.thisMonthAmount, byOperation: {} },
      commissions: commissionStats,
      contracts: contractStats,
      arrears: rentChargeStats,
      ranking: { topBrokers: brokerRanking, topOrigins: originRanking },
    };
  }

  private async getLeadStats(
    tenantId: string,
    monthStart: Date
  ): Promise<DashboardMetricsDto["leads"]> {
    const [total, thisMonth, statuses, converted] = await Promise.all([
      this.prisma.lead.count({ where: { tenantId } }),
      this.prisma.lead.count({ where: { tenantId, createdAt: { gte: monthStart } } }),
      this.prisma.lead.groupBy({
        by: ["status"],
        where: { tenantId },
        _count: true,
      }),
      this.prisma.lead.count({ where: { tenantId, status: "NEGOTIATION" } }),
    ]);

    const byStatus: Record<string, number> = {};
    statuses.forEach((s) => {
      byStatus[s.status] = s._count;
    });

    return {
      total,
      byStatus,
      thisMonth,
      conversionRate: total > 0 ? (converted / total) * 100 : 0,
    };
  }

  private async getClientStats(tenantId: string, monthStart: Date) {
    const [total, thisMonth, byType] = await Promise.all([
      this.prisma.client.count({ where: { tenantId } }),
      this.prisma.client.count({ where: { tenantId, createdAt: { gte: monthStart } } }),
      this.prisma.client.groupBy({
        by: ["type"],
        where: { tenantId },
        _count: true,
      }),
    ]);

    const result: Record<string, number> = {};
    byType.forEach((t) => {
      result[t.type] = t._count;
    });

    return { total, byType: result, thisMonth };
  }

  private async getPropertyStats(tenantId: string) {
    const [total, available, sold, rented, prices] = await Promise.all([
      this.prisma.property.count({ where: { tenantId } }),
      this.prisma.property.count({ where: { tenantId, status: "AVAILABLE" } }),
      this.prisma.property.count({ where: { tenantId, status: "SOLD" } }),
      this.prisma.property.count({ where: { tenantId, status: "RENTED" } }),
      this.prisma.property.findMany({
        where: { tenantId, salePrice: { not: null } },
        select: { salePrice: true },
        take: 100,
      }),
    ]);

    const avgPrice =
      prices.length > 0 ? prices.reduce((sum, p) => sum + Number(p.salePrice || 0), 0) / prices.length : 0;

    return { total, available, sold, rented, avgPrice };
  }

  private async getSaleStats(tenantId: string, monthStart: Date) {
    const [total, thisMonth, amount] = await Promise.all([
      this.prisma.sale.count({ where: { tenantId } }),
      this.prisma.sale.count({ where: { tenantId, saleDate: { gte: monthStart } } }),
      this.prisma.sale.aggregate({
        where: { tenantId },
        _sum: { finalSalePrice: true },
      }),
    ]);

    const [thisMonthAmount] = await Promise.all([
      this.prisma.sale.aggregate({
        where: { tenantId, saleDate: { gte: monthStart } },
        _sum: { finalSalePrice: true },
      }),
    ]);

    return {
      total,
      thisMonth,
      totalAmount: Number(amount._sum.finalSalePrice || 0),
      thisMonthAmount: Number(thisMonthAmount._sum.finalSalePrice || 0),
      avgCommission: total > 0 ? Number(amount._sum.finalSalePrice || 0) * 0.05 / total : 0,
    };
  }

  private async getLeaseStats(tenantId: string) {
    const [active, revenue, overdue] = await Promise.all([
      this.prisma.lease.count({ where: { tenantId, status: "ACTIVE" } }),
      this.prisma.lease.aggregate({
        where: { tenantId, status: "ACTIVE" },
        _sum: { monthlyRent: true },
      }),
      this.prisma.rentCharge.count({ where: { tenantId, status: "OVERDUE" } }),
    ]);

    return { active, revenue: Number(revenue._sum.monthlyRent || 0), overdue };
  }

  private async getCommissionStats(tenantId: string) {
    const stats = await this.prisma.commission.groupBy({
      by: ["status"],
      where: { tenantId },
      _count: true,
      _sum: { totalValue: true },
    });

    const result = { pending: 0, expected: 0, received: 0, pendingAmount: 0 };
    stats.forEach((s) => {
      if (s.status === "PENDING") result.pending = s._count;
      if (s.status === "EXPECTED") result.expected = s._count;
      if (s.status === "RECEIVED") result.received = s._count;
      if (s.status === "PENDING" || s.status === "EXPECTED") {
        result.pendingAmount += Number(s._sum.totalValue || 0);
      }
    });

    return result;
  }

  private async getContractStats(tenantId: string) {
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [total, expiring30days, overdue] = await Promise.all([
      this.prisma.lease.count({ where: { tenantId } }),
      this.prisma.lease.count({
        where: { tenantId, endDate: { lte: in30Days, gte: now } },
      }),
      this.prisma.lease.count({ where: { tenantId, endDate: { lt: now } } }),
    ]);

    return { total, expiring30days, overdue };
  }

  private async getRentChargeStats(tenantId: string) {
    const overdue = await this.prisma.rentCharge.findMany({
      where: { tenantId, status: "OVERDUE" },
      select: { totalAmount: true, dueDate: true },
    });

    const now = new Date();
    const daysOverdue =
      overdue.length > 0
        ? Math.floor(
            (now.getTime() - overdue[0].dueDate.getTime()) / (1000 * 60 * 60 * 24)
          )
        : 0;

    return {
      chargeCount: overdue.length,
      amount: overdue.reduce((sum, c) => sum + Number(c.totalAmount), 0),
      daysOverdue,
    };
  }

  private async getBrokerRanking(
    tenantId: string
  ): Promise<DashboardMetricsDto["ranking"]["topBrokers"]> {
    const sales = await this.prisma.sale.groupBy({
      by: ["brokerId"],
      where: { tenantId },
      _count: true,
      _sum: { finalSalePrice: true },
      orderBy: { _sum: { finalSalePrice: "desc" } },
      take: 5,
    });

    const brokers = await this.prisma.user.findMany({
      where: { id: { in: sales.map((s) => s.brokerId) } },
      select: { id: true, name: true },
    });

    const brokerMap = new Map(brokers.map((b) => [b.id, b.name]));

    return sales.map((s) => ({
      name: brokerMap.get(s.brokerId) || "Unknown",
      sales: s._count,
      amount: Number(s._sum.finalSalePrice || 0),
    }));
  }

  private async getOriginRanking(tenantId: string): Promise<DashboardMetricsDto["ranking"]["topOrigins"]> {
    const leads = await this.prisma.lead.findMany({
      where: { tenantId },
      select: { originId: true },
      take: 5000,
    });

    // Contar por originId
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      if (l.originId) {
        counts[l.originId] = (counts[l.originId] || 0) + 1;
      }
    });

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (sorted.length === 0) {
      return [];
    }

    const originDetails = await this.prisma.leadOrigin.findMany({
      where: { id: { in: sorted.map((s) => s[0]) } },
      select: { id: true, name: true },
    });

    const originMap = new Map(originDetails.map((o) => [o.id, o.name]));

    return sorted.map(([originId, count]) => ({
      name: originMap.get(originId) || "Unknown",
      leads: count,
    }));
  }
}
