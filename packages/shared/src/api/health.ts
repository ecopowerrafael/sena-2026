export type HealthStatus = "ok" | "degraded";

export interface HealthResponse {
  status: HealthStatus;
  uptime: number;
  timestamp: string;
  version: string;
}

export interface ReadyResponse {
  status: "ready" | "not_ready";
  checks: {
    database: "up" | "down";
  };
  timestamp: string;
}
