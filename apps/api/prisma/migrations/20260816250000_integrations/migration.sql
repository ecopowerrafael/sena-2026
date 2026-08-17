-- CreateTable
CREATE TABLE `integration_credentials` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `type` ENUM('DOCUMENT_VALIDATION', 'OCR', 'WHATSAPP', 'PAYMENT', 'SPLIT') NOT NULL,
    `providerName` VARCHAR(64) NOT NULL,
    `credentialEncrypted` LONGTEXT NOT NULL,
    `credentialHash` VARCHAR(64) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `lastValidated` DATETIME(3),
    `validationError` LONGTEXT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `integration_credentials_tenantId_type_isActive_idx`(`tenantId`, `type`, `isActive`),
    UNIQUE INDEX `integration_credentials_tenantId_type_providerName_key`(`tenantId`, `type`, `providerName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `externalId` VARCHAR(128),
    `amount` DECIMAL(15,2) NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `status` ENUM('PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `paymentMethod` VARCHAR(64) NOT NULL,
    `cardLast4` VARCHAR(4),
    `cardBrand` VARCHAR(32),
    `authorizedAt` DATETIME(3),
    `capturedAt` DATETIME(3),
    `failedAt` DATETIME(3),
    `failureReason` LONGTEXT,
    `idempotencyKey` VARCHAR(128),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payments_externalId_key`(`externalId`),
    UNIQUE INDEX `payments_idempotencyKey_key`(`idempotencyKey`),
    INDEX `payments_tenantId_status_idx`(`tenantId`, `status`),
    INDEX `payments_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_splits` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `paymentId` VARCHAR(191) NOT NULL,
    `recipientRole` ENUM('AGENCY', 'MANAGER', 'CAPTATOR', 'BROKER', 'PARTNER') NOT NULL,
    `recipientUserId` VARCHAR(191),
    `amount` DECIMAL(15,2) NOT NULL,
    `percentage` DECIMAL(6,2) NOT NULL,
    `status` VARCHAR(64) NOT NULL,
    `paidAt` DATETIME(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `payment_splits_paymentId_idx`(`paymentId`),
    INDEX `payment_splits_tenantId_idx`(`tenantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `webhook_events` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `type` ENUM('PAYMENT_RECEIVED', 'PAYMENT_FAILED', 'OCR_COMPLETED', 'OCR_FAILED', 'SPLIT_PAYOUT') NOT NULL,
    `paymentId` VARCHAR(191),
    `externalId` VARCHAR(256) NOT NULL,
    `payload` JSON NOT NULL,
    `processed` BOOLEAN NOT NULL DEFAULT false,
    `processedAt` DATETIME(3),
    `processError` LONGTEXT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `webhook_events_tenantId_externalId_key`(`tenantId`, `externalId`),
    INDEX `webhook_events_tenantId_processed_idx`(`tenantId`, `processed`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `document_requests` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `documentType` VARCHAR(32) NOT NULL,
    `documentHash` VARCHAR(64) NOT NULL,
    `resultStatus` VARCHAR(64),
    `resultData` JSON,
    `validatedAt` DATETIME(3),
    `auditedByUserId` VARCHAR(191),
    `auditedAt` DATETIME(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `document_requests_tenantId_createdAt_idx`(`tenantId`, `createdAt`),
    INDEX `document_requests_clientId_idx`(`clientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ocr_results` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191),
    `documentHash` VARCHAR(64) NOT NULL,
    `extractedText` LONGTEXT NOT NULL,
    `extractedData` JSON NOT NULL,
    `confidence` DECIMAL(3,2),
    `reviewedByUserId` VARCHAR(191),
    `reviewedAt` DATETIME(3),
    `approvedAt` DATETIME(3),
    `rejectedAt` DATETIME(3),
    `rejectionReason` LONGTEXT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ocr_results_tenantId_approvedAt_idx`(`tenantId`, `approvedAt`),
    INDEX `ocr_results_clientId_idx`(`clientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `whatsapp_messages` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `recipientPhone` VARCHAR(32) NOT NULL,
    `messageBody` LONGTEXT NOT NULL,
    `templateName` VARCHAR(128),
    `externalId` VARCHAR(128),
    `status` VARCHAR(32) NOT NULL,
    `deliveredAt` DATETIME(3),
    `readAt` DATETIME(3),
    `failureReason` LONGTEXT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `whatsapp_messages_tenantId_createdAt_idx`(`tenantId`, `createdAt`),
    INDEX `whatsapp_messages_recipientPhone_idx`(`recipientPhone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `integration_credentials` ADD CONSTRAINT `integration_credentials_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_splits` ADD CONSTRAINT `payment_splits_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_splits` ADD CONSTRAINT `payment_splits_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `payments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_splits` ADD CONSTRAINT `payment_splits_recipientUserId_fkey` FOREIGN KEY (`recipientUserId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `webhook_events` ADD CONSTRAINT `webhook_events_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `webhook_events` ADD CONSTRAINT `webhook_events_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `payments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_requests` ADD CONSTRAINT `document_requests_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_requests` ADD CONSTRAINT `document_requests_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_requests` ADD CONSTRAINT `document_requests_auditedByUserId_fkey` FOREIGN KEY (`auditedByUserId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ocr_results` ADD CONSTRAINT `ocr_results_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ocr_results` ADD CONSTRAINT `ocr_results_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ocr_results` ADD CONSTRAINT `ocr_results_reviewedByUserId_fkey` FOREIGN KEY (`reviewedByUserId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `whatsapp_messages` ADD CONSTRAINT `whatsapp_messages_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
