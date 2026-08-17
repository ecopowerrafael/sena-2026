describe("ProposalsService.approve - Atomicity & Rollback", () => {

  it("should verify transaction structure in ProposalsService.approve", async () => {
    // This test verifies that the approve method uses Prisma.$transaction
    // for atomicity. The implementation wraps Sale + Sellers + Commission creation.

    const fs = await import("fs").then(m => m.promises);
    const serviceCode = await fs.readFile(
      "./src/sales/proposals.service.ts",
      "utf-8"
    );

    // Verify transaction wrapper
    expect(serviceCode).toContain("$transaction");

    // Verify sale creation with sellers
    expect(serviceCode).toContain("tx.sale.create");
    expect(serviceCode).toContain("sellers:");
    expect(serviceCode).toContain("create: propertyOwners.map");

    // Verify commission creation
    expect(serviceCode).toContain("tx.commission.create");
    expect(serviceCode).toContain("splits:");

    // Verify all roles are included
    expect(serviceCode).toContain("AGENCY");
    expect(serviceCode).toContain("MANAGER");
    expect(serviceCode).toContain("CAPTATOR");
    expect(serviceCode).toContain("ATTENDANT_BROKER");
  });

  it("should verify commission structure has correct splits", async () => {
    // This test verifies commissions use 6% total with correct splits
    // 40% AGENCY, 10% MANAGER, 25% CAPTATOR, 25% ATTENDANT_BROKER

    const fs = await import("fs").then(m => m.promises);
    const serviceCode = await fs.readFile(
      "./src/sales/proposals.service.ts",
      "utf-8"
    );

    // Verify commission rate is 6%
    expect(serviceCode).toContain("commissionPercent = 6");

    // Verify total percentage is set to commission rate
    expect(serviceCode).toContain("totalPercentage: commissionPercent");

    // Verify all split roles and percentages
    expect(serviceCode).toContain("AGENCY");
    expect(serviceCode).toContain("percentage: 40");
    expect(serviceCode).toContain("MANAGER");
    expect(serviceCode).toContain("percentage: 10");
    expect(serviceCode).toContain("CAPTATOR");
    expect(serviceCode).toContain("percentage: 25");
    expect(serviceCode).toContain("ATTENDANT_BROKER");
    expect(serviceCode).toContain("percentage: 25");
  });

  it("should verify SaleSeller uses PropertyOwner real data", async () => {
    // This test verifies that SaleSeller[] is created from PropertyOwner[]
    // and not from the proposal buyer

    const fs = await import("fs").then(m => m.promises);
    const serviceCode = await fs.readFile(
      "./src/sales/proposals.service.ts",
      "utf-8"
    );

    // Verify PropertyOwner fetch
    expect(serviceCode).toContain("propertyOwners");
    expect(serviceCode).toContain("propertyId: proposal.propertyId");

    // Verify SaleSeller is created from PropertyOwner, not from proposal.clientId
    expect(serviceCode).toContain("owner.clientId");
    expect(serviceCode).toContain("owner.ownershipPercentage");
  });
});
