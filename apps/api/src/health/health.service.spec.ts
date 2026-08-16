import { Test } from "@nestjs/testing";
import { PrismaService } from "../database/prisma.service";
import { HealthService } from "./health.service";

describe("HealthService", () => {
  const prisma = { isHealthy: jest.fn() };

  const build = async (): Promise<HealthService> => {
    const moduleRef = await Test.createTestingModule({
      providers: [HealthService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    return moduleRef.get(HealthService);
  };

  beforeEach(() => {
    prisma.isHealthy.mockReset();
  });

  it("responde ok no liveness", async () => {
    const service = await build();

    expect(service.check().status).toBe("ok");
  });

  it("responde ready quando o banco está de pé", async () => {
    prisma.isHealthy.mockResolvedValue(true);
    const service = await build();

    await expect(service.ready()).resolves.toMatchObject({
      status: "ready",
      checks: { database: "up" },
    });
  });

  it("responde not_ready quando o banco está fora", async () => {
    prisma.isHealthy.mockResolvedValue(false);
    const service = await build();

    await expect(service.ready()).resolves.toMatchObject({
      status: "not_ready",
      checks: { database: "down" },
    });
  });
});
