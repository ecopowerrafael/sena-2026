Loaded Prisma config from prisma.config.ts.

-- CreateTable
CREATE TABLE `developments` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `developerCompany` VARCHAR(255) NULL,
    `location` TEXT NOT NULL,
    `launchDate` DATETIME(3) NOT NULL,
    `deliveryForecast` DATETIME(3) NULL,
    `commissionPercentage` DECIMAL(6, 2) NOT NULL,
    `campaignId` VARCHAR(191) NULL,
    `status` VARCHAR(64) NOT NULL,
    `heroAssetId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `developments_tenantId_status_idx`(`tenantId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `development_blocks` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `developmentId` VARCHAR(191) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `development_blocks_developmentId_sortOrder_idx`(`developmentId`, `sortOrder`),
    UNIQUE INDEX `development_blocks_developmentId_code_key`(`developmentId`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lots` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `developmentId` VARCHAR(191) NOT NULL,
    `blockId` VARCHAR(191) NOT NULL,
    `lotNumber` VARCHAR(64) NOT NULL,
    `areaM2` DECIMAL(10, 2) NOT NULL,
    `basePrice` DECIMAL(15, 2) NOT NULL,
    `promotionalPrice` DECIMAL(15, 2) NULL,
    `minDownPayment` DECIMAL(15, 2) NOT NULL,
    `maxInstallments` INTEGER NOT NULL DEFAULT 120,
    `status` ENUM('AVAILABLE', 'RESERVED', 'PROPOSAL', 'SOLD', 'BLOCKED', 'CANCELLATION') NOT NULL DEFAULT 'AVAILABLE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `lots_developmentId_status_idx`(`developmentId`, `status`),
    INDEX `lots_tenantId_idx`(`tenantId`),
    UNIQUE INDEX `lots_developmentId_blockId_lotNumber_key`(`developmentId`, `blockId`, `lotNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lot_reservations` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `lotId` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `brokerId` VARCHAR(191) NOT NULL,
    `reservedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,
    `status` ENUM('ACTIVE', 'EXPIRED', 'CANCELLED', 'CONVERTED_TO_PROPOSAL') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `lot_reservations_lotId_key`(`lotId`),
    INDEX `lot_reservations_lotId_status_idx`(`lotId`, `status`),
    INDEX `lot_reservations_tenantId_expiresAt_idx`(`tenantId`, `expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lot_simulations` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `lotId` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NULL,
    `brokerId` VARCHAR(191) NOT NULL,
    `entryAmount` DECIMAL(15, 2) NOT NULL,
    `installments` INTEGER NOT NULL,
    `discountAmount` DECIMAL(15, 2) NOT NULL,
    `financedBalance` DECIMAL(15, 2) NOT NULL,
    `interestRate` DECIMAL(6, 2) NULL,
    `installmentValue` DECIMAL(15, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `lot_simulations_lotId_idx`(`lotId`),
    INDEX `lot_simulations_tenantId_createdAt_idx`(`tenantId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lot_proposals` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `developmentId` VARCHAR(191) NOT NULL,
    `lotId` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `brokerId` VARCHAR(191) NOT NULL,
    `proposedPrice` DECIMAL(15, 2) NOT NULL,
    `entryAmount` DECIMAL(15, 2) NOT NULL,
    `installments` INTEGER NOT NULL,
    `interestRate` DECIMAL(6, 2) NULL,
    `status` ENUM('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'APPROVED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `proposedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NULL,
    `approvedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `lot_proposals_lotId_status_idx`(`lotId`, `status`),
    INDEX `lot_proposals_tenantId_status_idx`(`tenantId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lot_proposal_history` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `proposalId` VARCHAR(191) NOT NULL,
    `fromStatus` ENUM('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'APPROVED', 'CANCELLED') NULL,
    `toStatus` ENUM('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'APPROVED', 'CANCELLED') NOT NULL,
    `reason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `lot_proposal_history_proposalId_createdAt_idx`(`proposalId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lot_sales` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `developmentId` VARCHAR(191) NOT NULL,
    `lotId` VARCHAR(191) NOT NULL,
    `proposalId` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `brokerId` VARCHAR(191) NOT NULL,
    `finalPrice` DECIMAL(15, 2) NOT NULL,
    `entryAmount` DECIMAL(15, 2) NOT NULL,
    `installments` INTEGER NOT NULL,
    `interestRate` DECIMAL(6, 2) NULL,
    `contractNumber` VARCHAR(64) NULL,
    `saleDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `lot_sales_lotId_key`(`lotId`),
    UNIQUE INDEX `lot_sales_proposalId_key`(`proposalId`),
    INDEX `lot_sales_developmentId_saleDate_idx`(`developmentId`, `saleDate`),
    INDEX `lot_sales_tenantId_idx`(`tenantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `developments` ADD CONSTRAINT `developments_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `development_blocks` ADD CONSTRAINT `development_blocks_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `development_blocks` ADD CONSTRAINT `development_blocks_developmentId_fkey` FOREIGN KEY (`developmentId`) REFERENCES `developments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lots` ADD CONSTRAINT `lots_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lots` ADD CONSTRAINT `lots_developmentId_fkey` FOREIGN KEY (`developmentId`) REFERENCES `developments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lots` ADD CONSTRAINT `lots_blockId_fkey` FOREIGN KEY (`blockId`) REFERENCES `development_blocks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lot_reservations` ADD CONSTRAINT `lot_reservations_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lot_reservations` ADD CONSTRAINT `lot_reservations_lotId_fkey` FOREIGN KEY (`lotId`) REFERENCES `lots`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lot_reservations` ADD CONSTRAINT `lot_reservations_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lot_reservations` ADD CONSTRAINT `lot_reservations_brokerId_fkey` FOREIGN KEY (`brokerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lot_simulations` ADD CONSTRAINT `lot_simulations_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lot_simulations` ADD CONSTRAINT `lot_simulations_lotId_fkey` FOREIGN KEY (`lotId`) REFERENCES `lots`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lot_simulations` ADD CONSTRAINT `lot_simulations_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lot_simulations` ADD CONSTRAINT `lot_simulations_brokerId_fkey` FOREIGN KEY (`brokerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lot_proposals` ADD CONSTRAINT `lot_proposals_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lot_proposals` ADD CONSTRAINT `lot_proposals_developmentId_fkey` FOREIGN KEY (`developmentId`) REFERENCES `developments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lot_proposals` ADD CONSTRAINT `lot_proposals_lotId_fkey` FOREIGN KEY (`lotId`) REFERENCES `lots`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lot_proposals` ADD CONSTRAINT `lot_proposals_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lot_proposals` ADD CONSTRAINT `lot_proposals_brokerId_fkey` FOREIGN KEY (`brokerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lot_proposal_history` ADD CONSTRAINT `lot_proposal_history_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lot_proposal_history` ADD CONSTRAINT `lot_proposal_history_proposalId_fkey` FOREIGN KEY (`proposalId`) REFERENCES `lot_proposals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lot_sales` ADD CONSTRAINT `lot_sales_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lot_sales` ADD CONSTRAINT `lot_sales_developmentId_fkey` FOREIGN KEY (`developmentId`) REFERENCES `developments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lot_sales` ADD CONSTRAINT `lot_sales_lotId_fkey` FOREIGN KEY (`lotId`) REFERENCES `lots`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lot_sales` ADD CONSTRAINT `lot_sales_proposalId_fkey` FOREIGN KEY (`proposalId`) REFERENCES `lot_proposals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lot_sales` ADD CONSTRAINT `lot_sales_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lot_sales` ADD CONSTRAINT `lot_sales_brokerId_fkey` FOREIGN KEY (`brokerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

