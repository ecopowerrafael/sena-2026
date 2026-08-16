-- CreateTable
CREATE TABLE `properties` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `type` ENUM('RESIDENTIAL_HOUSE', 'APARTMENT', 'PENTHOUSE', 'TOWNHOUSE', 'LOT', 'FARM', 'COMMERCIAL_OFFICE', 'WAREHOUSE', 'BUILDING') NOT NULL,
    `purpose` ENUM('SALE', 'RENT', 'BOTH') NOT NULL,
    `captatorBrokerId` VARCHAR(191) NULL,
    `salePrice` DECIMAL(15, 2) NULL,
    `rentalPrice` DECIMAL(15, 2) NULL,
    `condoFee` DECIMAL(15, 2) NULL,
    `iptu` DECIMAL(15, 2) NULL,
    `addressLine` VARCHAR(191) NOT NULL,
    `number` VARCHAR(191) NULL,
    `complement` VARCHAR(120) NULL,
    `neighborhood` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(2) NOT NULL,
    `zipCode` VARCHAR(10) NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `totalArea` DECIMAL(10, 2) NULL,
    `privateArea` DECIMAL(10, 2) NULL,
    `bedrooms` INTEGER NULL,
    `suites` INTEGER NULL,
    `bathrooms` INTEGER NULL,
    `parkingSpots` INTEGER NULL,
    `documentationStatus` ENUM('FULLY_REGULARIZED', 'IN_INVENTORY', 'HABITE_PENDING', 'FINANCEABLE') NOT NULL DEFAULT 'FULLY_REGULARIZED',
    `isExclusive` BOOLEAN NOT NULL DEFAULT false,
    `exclusivityEndsAt` DATETIME(3) NULL,
    `status` ENUM('CAPTURING', 'AVAILABLE', 'RESERVED', 'NEGOTIATION', 'SOLD', 'RENTED', 'SUSPENDED') NOT NULL DEFAULT 'AVAILABLE',
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `properties_tenantId_status_idx`(`tenantId`, `status`),
    INDEX `properties_tenantId_captatorBrokerId_idx`(`tenantId`, `captatorBrokerId`),
    UNIQUE INDEX `properties_tenantId_code_key`(`tenantId`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `property_owners` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `ownershipPercentage` INTEGER NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `property_owners_tenantId_idx`(`tenantId`),
    UNIQUE INDEX `property_owners_propertyId_clientId_key`(`propertyId`, `clientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `property_features` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `property_features_propertyId_name_key`(`propertyId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assets` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(32) NOT NULL,
    `storageProvider` ENUM('LOCAL', 'S3') NOT NULL,
    `path` VARCHAR(512) NOT NULL,
    `mimeType` VARCHAR(128) NOT NULL,
    `size` INTEGER NOT NULL,
    `checksum` VARCHAR(64) NOT NULL,
    `createdByUserId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `assets_tenantId_kind_idx`(`tenantId`, `kind`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `property_media` (
    `id` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `assetId` VARCHAR(191) NOT NULL,
    `type` ENUM('PHOTO', 'VIDEO', 'DOCUMENT') NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `property_media_propertyId_sortOrder_idx`(`propertyId`, `sortOrder`),
    UNIQUE INDEX `property_media_propertyId_assetId_key`(`propertyId`, `assetId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `interest_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `objective` ENUM('BUY', 'RENT') NOT NULL,
    `minPrice` DECIMAL(15, 2) NULL,
    `maxPrice` DECIMAL(15, 2) NULL,
    `minBedrooms` INTEGER NULL,
    `minSuites` INTEGER NULL,
    `minParkingSpots` INTEGER NULL,
    `paymentMethod` JSON NOT NULL,
    `needsFinancing` BOOLEAN NOT NULL DEFAULT false,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `preferredNeighborhoods` TEXT NULL,

    UNIQUE INDEX `interest_profiles_clientId_key`(`clientId`),
    INDEX `interest_profiles_tenantId_objective_idx`(`tenantId`, `objective`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PropertyMatches` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_PropertyMatches_AB_unique`(`A`, `B`),
    INDEX `_PropertyMatches_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `properties` ADD CONSTRAINT `properties_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `properties` ADD CONSTRAINT `properties_captatorBrokerId_fkey` FOREIGN KEY (`captatorBrokerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `property_owners` ADD CONSTRAINT `property_owners_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `property_owners` ADD CONSTRAINT `property_owners_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `property_owners` ADD CONSTRAINT `property_owners_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `property_features` ADD CONSTRAINT `property_features_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `property_features` ADD CONSTRAINT `property_features_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assets` ADD CONSTRAINT `assets_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assets` ADD CONSTRAINT `assets_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `property_media` ADD CONSTRAINT `property_media_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `property_media` ADD CONSTRAINT `property_media_assetId_fkey` FOREIGN KEY (`assetId`) REFERENCES `assets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `interest_profiles` ADD CONSTRAINT `interest_profiles_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `interest_profiles` ADD CONSTRAINT `interest_profiles_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PropertyMatches` ADD CONSTRAINT `_PropertyMatches_A_fkey` FOREIGN KEY (`A`) REFERENCES `interest_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PropertyMatches` ADD CONSTRAINT `_PropertyMatches_B_fkey` FOREIGN KEY (`B`) REFERENCES `properties`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

