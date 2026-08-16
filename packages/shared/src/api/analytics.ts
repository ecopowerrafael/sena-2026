export interface DashboardMetricsDto {
  leads: {
    total: number;
    byStatus: Record<string, number>;
    thisMonth: number;
    conversionRate: number;
  };
  clients: {
    total: number;
    byType: Record<string, number>;
    thisMonth: number;
  };
  properties: {
    total: number;
    available: number;
    sold: number;
    rented: number;
    avgPrice: number;
  };
  sales: {
    total: number;
    thisMonth: number;
    totalAmount: number;
    thisMonthAmount: number;
    avgCommission: number;
  };
  leases: {
    active: number;
    revenue: number;
    overdue: number;
  };
  vgv: {
    total: number;
    thisMonth: number;
    byOperation: Record<string, number>;
  };
  commissions: {
    pending: number;
    expected: number;
    received: number;
    pendingAmount: number;
  };
  contracts: {
    total: number;
    expiring30days: number;
    overdue: number;
  };
  arrears: {
    chargeCount: number;
    amount: number;
    daysOverdue: number;
  };
  ranking: {
    topBrokers: Array<{ name: string; sales: number; amount: number }>;
    topOrigins: Array<{ name: string; leads: number }>;
  };
}

export interface BrokerReportDto {
  brokerId: string;
  brokerName: string;
  period: { start: string; end: string };
  leads: {
    total: number;
    converted: number;
    conversionRate: number;
  };
  sales: {
    count: number;
    totalAmount: number;
    avgValue: number;
  };
  commissions: {
    total: number;
    earned: number;
    pending: number;
  };
  leases: {
    count: number;
    totalMonthlyRent: number;
  };
  visits: number;
  createdAt: string;
}

export interface ManagerReportDto {
  managerId: string;
  managerName: string;
  period: { start: string; end: string };
  brokerCount: number;
  teamMetrics: {
    leadsGenerated: number;
    leadsConverted: number;
    conversionRate: number;
    salesCount: number;
    salesAmount: number;
    commissionsEarned: number;
    commissionsDistributed: number;
  };
  topPerformers: Array<{ brokerId: string; brokerName: string; sales: number }>;
  createdAt: string;
}

export interface VGVReportDto {
  period: { start: string; end: string };
  byOperation: Record<string, number>;
  byBroker: Record<string, number>;
  byOrigin: Record<string, number>;
  total: number;
  realized: number;
  forecast: number;
  createdAt: string;
}

export interface CommissionReportDto {
  period: { start: string; end: string };
  totalCommissions: number;
  bySeller: Record<string, number>;
  byRole: Record<string, number>;
  status: Record<string, number>;
  ranking: Array<{ sellerId: string; sellerName: string; amount: number; role: string }>;
  createdAt: string;
}

export interface AlertDto {
  id: string;
  type: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  entityId: string;
  entityType: string;
  message: string;
  createdAt: string;
  resolvedAt: string | null;
}
