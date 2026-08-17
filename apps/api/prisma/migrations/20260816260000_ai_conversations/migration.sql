-- CreateEnum
CREATE TABLE `ai_conversations` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `provider` VARCHAR(64) NOT NULL,
    `status` VARCHAR(32) NOT NULL,
    `messagesCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ai_conversations_tenantId_userId_createdAt_idx`(`tenantId`, `userId`, `createdAt`),
    INDEX `ai_conversations_tenantId_status_idx`(`tenantId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_messages` (
    `id` VARCHAR(191) NOT NULL,
    `conversationId` VARCHAR(191) NOT NULL,
    `role` VARCHAR(32) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `toolName` ENUM('SEARCH_CLIENTS', 'SEARCH_PROPERTIES', 'FIND_MATCHING_PROPERTIES', 'GET_BROKER_PERFORMANCE', 'GET_COMMISSION_SUMMARY', 'GET_OVERDUE_RENTALS', 'GET_EXPIRING_LEASES', 'GET_AVAILABLE_LOTS', 'CREATE_FOLLOWUP_DRAFT'),
    `toolInput` JSON,
    `toolOutput` JSON,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ai_messages_conversationId_createdAt_idx`(`conversationId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_consumption` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191),
    `provider` VARCHAR(64) NOT NULL,
    `model` VARCHAR(128) NOT NULL,
    `toolName` ENUM('SEARCH_CLIENTS', 'SEARCH_PROPERTIES', 'FIND_MATCHING_PROPERTIES', 'GET_BROKER_PERFORMANCE', 'GET_COMMISSION_SUMMARY', 'GET_OVERDUE_RENTALS', 'GET_EXPIRING_LEASES', 'GET_AVAILABLE_LOTS', 'CREATE_FOLLOWUP_DRAFT'),
    `inputTokens` INTEGER NOT NULL DEFAULT 0,
    `outputTokens` INTEGER NOT NULL DEFAULT 0,
    `cost` DECIMAL(10,4) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ai_consumption_tenantId_createdAt_idx`(`tenantId`, `createdAt`),
    INDEX `ai_consumption_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ai_conversations` ADD CONSTRAINT `ai_conversations_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_conversations` ADD CONSTRAINT `ai_conversations_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_messages` ADD CONSTRAINT `ai_messages_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `ai_conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_consumption` ADD CONSTRAINT `ai_consumption_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
