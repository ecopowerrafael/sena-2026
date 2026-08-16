-- CreateTable
CREATE TABLE `leases` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `contractNumber` VARCHAR(64) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `responsibleBrokerId` VARCHAR(191) NULL,
    `monthlyRent` DECIMAL(15, 2) NOT NULL,
    `condoFee` DECIMAL(15, 2) NULL,
    `iptuFee` DECIMAL(15, 2) NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `dueDay` TINYINT NOT NULL,
    `guaranteeType` VARCHAR(64) NOT NULL,
    `adminFeePercentage` DECIMAL(6, 2) NOT NULL,
    `adjustmentIndex` VARCHAR(64) NULL,
    `nextAdjustmentDate` DATETIME(3) NULL,
    `status` ENUM('ACTIVE', 'PAUSED', 'COMPLETED', 'TERMINATED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `leases_propertyId_status_idx`(`propertyId`, `status`),
    INDEX `leases_tenantId_status_idx`(`tenantId`, `status`),
    UNIQUE INDEX `leases_tenantId_contractNumber_key`(`tenantId`, `contractNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lease_tenants` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `leaseId` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `percentage` DECIMAL(5, 2) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `lease_tenants_leaseId_idx`(`leaseId`),
    UNIQUE INDEX `lease_tenants_leaseId_clientId_key`(`leaseId`, `clientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lease_owners` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `leaseId` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `percentage` DECIMAL(5, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `lease_owners_leaseId_idx`(`leaseId`),
    UNIQUE INDEX `lease_owners_leaseId_clientId_key`(`leaseId`, `clientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rent_charges` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `leaseId` VARCHAR(191) NOT NULL,
    `competence` DATE NOT NULL,
    `dueDate` DATETIME(3) NOT NULL,
    `rentAmount` DECIMAL(15, 2) NOT NULL,
    `condoAmount` DECIMAL(15, 2) NOT NULL,
    `iptuAmount` DECIMAL(15, 2) NOT NULL,
    `otherAmount` DECIMAL(15, 2) NOT NULL,
    `discountAmount` DECIMAL(15, 2) NOT NULL,
    `fineAmount` DECIMAL(15, 2) NOT NULL,
    `interestAmount` DECIMAL(15, 2) NOT NULL,
    `totalAmount` DECIMAL(15, 2) NOT NULL,
    `status` ENUM('PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `rent_charges_leaseId_status_idx`(`leaseId`, `status`),
    INDEX `rent_charges_tenantId_status_idx`(`tenantId`, `status`),
    UNIQUE INDEX `rent_charges_leaseId_competence_key`(`leaseId`, `competence`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rent_payments` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `chargeId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `paymentDate` DATETIME(3) NOT NULL,
    `receiptUrl` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `rent_payments_chargeId_idx`(`chargeId`),
    INDEX `rent_payments_tenantId_paymentDate_idx`(`tenantId`, `paymentDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `owner_payouts` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `leaseId` VARCHAR(191) NOT NULL,
    `competence` DATE NOT NULL,
    `ownerClientId` VARCHAR(191) NOT NULL,
    `rentAmount` DECIMAL(15, 2) NOT NULL,
    `adminFeeAmount` DECIMAL(15, 2) NOT NULL,
    `expensesAmount` DECIMAL(15, 2) NOT NULL,
    `netAmount` DECIMAL(15, 2) NOT NULL,
    `payoutDate` DATETIME(3) NULL,
    `payoutReceiptUrl` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `owner_payouts_leaseId_idx`(`leaseId`),
    INDEX `owner_payouts_tenantId_idx`(`tenantId`),
    UNIQUE INDEX `owner_payouts_leaseId_competence_ownerClientId_key`(`leaseId`, `competence`, `ownerClientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rental_expenses` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `leaseId` VARCHAR(191) NOT NULL,
    `competence` DATE NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `isAuthorized` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `authorizedAt` DATETIME(3) NULL,

    INDEX `rental_expenses_leaseId_competence_idx`(`leaseId`, `competence`),
    INDEX `rental_expenses_tenantId_idx`(`tenantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inspections` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `leaseId` VARCHAR(191) NOT NULL,
    `inspectionType` ENUM('ENTRY', 'PERIODIC', 'EXIT') NOT NULL,
    `inspectorName` VARCHAR(180) NULL,
    `notes` TEXT NULL,
    `inspectedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `inspections_leaseId_inspectionType_idx`(`leaseId`, `inspectionType`),
    INDEX `inspections_tenantId_idx`(`tenantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inspection_items` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `inspectionId` VARCHAR(191) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `status` VARCHAR(64) NOT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `inspection_items_inspectionId_idx`(`inspectionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inspection_media` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `inspectionId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(64) NOT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `inspection_media_inspectionId_idx`(`inspectionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `maintenance_requests` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `leaseId` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `status` ENUM('REQUESTED', 'QUOTED', 'APPROVED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'REQUESTED',
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `maintenance_requests_leaseId_status_idx`(`leaseId`, `status`),
    INDEX `maintenance_requests_tenantId_idx`(`tenantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_providers` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(180) NOT NULL,
    `phone` VARCHAR(32) NULL,
    `email` VARCHAR(180) NULL,
    `category` VARCHAR(64) NULL,
    `notes` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `service_providers_tenantId_isActive_idx`(`tenantId`, `isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `maintenance_quotes` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `requestId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `dueDate` DATETIME(3) NULL,
    `isApproved` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `approvedAt` DATETIME(3) NULL,

    INDEX `maintenance_quotes_requestId_idx`(`requestId`),
    INDEX `maintenance_quotes_providerId_idx`(`providerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `maintenance_events` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `requestId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `completedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `invoiceUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `maintenance_events_requestId_idx`(`requestId`),
    INDEX `maintenance_events_providerId_idx`(`providerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `leases` ADD CONSTRAINT `leases_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leases` ADD CONSTRAINT `leases_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leases` ADD CONSTRAINT `leases_responsibleBrokerId_fkey` FOREIGN KEY (`responsibleBrokerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lease_tenants` ADD CONSTRAINT `lease_tenants_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lease_tenants` ADD CONSTRAINT `lease_tenants_leaseId_fkey` FOREIGN KEY (`leaseId`) REFERENCES `leases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lease_tenants` ADD CONSTRAINT `lease_tenants_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lease_owners` ADD CONSTRAINT `lease_owners_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lease_owners` ADD CONSTRAINT `lease_owners_leaseId_fkey` FOREIGN KEY (`leaseId`) REFERENCES `leases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lease_owners` ADD CONSTRAINT `lease_owners_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rent_charges` ADD CONSTRAINT `rent_charges_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rent_charges` ADD CONSTRAINT `rent_charges_leaseId_fkey` FOREIGN KEY (`leaseId`) REFERENCES `leases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rent_payments` ADD CONSTRAINT `rent_payments_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rent_payments` ADD CONSTRAINT `rent_payments_chargeId_fkey` FOREIGN KEY (`chargeId`) REFERENCES `rent_charges`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `owner_payouts` ADD CONSTRAINT `owner_payouts_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `owner_payouts` ADD CONSTRAINT `owner_payouts_leaseId_fkey` FOREIGN KEY (`leaseId`) REFERENCES `leases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `owner_payouts` ADD CONSTRAINT `owner_payouts_ownerClientId_fkey` FOREIGN KEY (`ownerClientId`) REFERENCES `clients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rental_expenses` ADD CONSTRAINT `rental_expenses_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rental_expenses` ADD CONSTRAINT `rental_expenses_leaseId_fkey` FOREIGN KEY (`leaseId`) REFERENCES `leases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inspections` ADD CONSTRAINT `inspections_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inspections` ADD CONSTRAINT `inspections_leaseId_fkey` FOREIGN KEY (`leaseId`) REFERENCES `leases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inspection_items` ADD CONSTRAINT `inspection_items_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inspection_items` ADD CONSTRAINT `inspection_items_inspectionId_fkey` FOREIGN KEY (`inspectionId`) REFERENCES `inspections`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inspection_media` ADD CONSTRAINT `inspection_media_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inspection_media` ADD CONSTRAINT `inspection_media_inspectionId_fkey` FOREIGN KEY (`inspectionId`) REFERENCES `inspections`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `maintenance_requests` ADD CONSTRAINT `maintenance_requests_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `maintenance_requests` ADD CONSTRAINT `maintenance_requests_leaseId_fkey` FOREIGN KEY (`leaseId`) REFERENCES `leases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_providers` ADD CONSTRAINT `service_providers_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `maintenance_quotes` ADD CONSTRAINT `maintenance_quotes_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `maintenance_quotes` ADD CONSTRAINT `maintenance_quotes_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `maintenance_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `maintenance_quotes` ADD CONSTRAINT `maintenance_quotes_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `service_providers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `maintenance_events` ADD CONSTRAINT `maintenance_events_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `maintenance_events` ADD CONSTRAINT `maintenance_events_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `maintenance_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `maintenance_events` ADD CONSTRAINT `maintenance_events_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `service_providers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

