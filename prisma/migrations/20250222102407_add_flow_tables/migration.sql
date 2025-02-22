-- CreateTable
CREATE TABLE `FlowNodeDefinition` (
    `id` VARCHAR(191) NOT NULL,
    `definitionKey` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `componentName` VARCHAR(191) NOT NULL,
    `componentPath` VARCHAR(191) NULL,
    `config` VARCHAR(191) NOT NULL DEFAULT '{}',
    `uiConfig` VARCHAR(191) NOT NULL DEFAULT '{}',
    `handles` VARCHAR(191) NOT NULL DEFAULT '{}',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `FlowNodeDefinition_definitionKey_key`(`definitionKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FlowTemplate` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `version` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `nodes` VARCHAR(191) NOT NULL DEFAULT '[]',
    `edges` VARCHAR(191) NOT NULL DEFAULT '[]',
    `metadata` VARCHAR(191) NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `updatedBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FlowInstance` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `templateId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `context` VARCHAR(191) NOT NULL DEFAULT '{}',
    `nodes` VARCHAR(191) NOT NULL DEFAULT '[]',
    `edges` VARCHAR(191) NOT NULL DEFAULT '[]',
    `createdBy` VARCHAR(191) NOT NULL,
    `updatedBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FlowDocument` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `instanceId` VARCHAR(191) NOT NULL,
    `nodeId` VARCHAR(191) NULL,
    `docType` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `metadata` VARCHAR(191) NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_FlowNodeDefinitionToFlowTemplate` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_FlowNodeDefinitionToFlowTemplate_AB_unique`(`A`, `B`),
    INDEX `_FlowNodeDefinitionToFlowTemplate_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FlowTemplate` ADD CONSTRAINT `FlowTemplate_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FlowTemplate` ADD CONSTRAINT `FlowTemplate_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FlowInstance` ADD CONSTRAINT `FlowInstance_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FlowInstance` ADD CONSTRAINT `FlowInstance_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `FlowTemplate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FlowInstance` ADD CONSTRAINT `FlowInstance_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FlowInstance` ADD CONSTRAINT `FlowInstance_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FlowDocument` ADD CONSTRAINT `FlowDocument_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FlowDocument` ADD CONSTRAINT `FlowDocument_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `FlowInstance`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FlowDocument` ADD CONSTRAINT `FlowDocument_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FlowNodeDefinitionToFlowTemplate` ADD CONSTRAINT `_FlowNodeDefinitionToFlowTemplate_A_fkey` FOREIGN KEY (`A`) REFERENCES `FlowNodeDefinition`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FlowNodeDefinitionToFlowTemplate` ADD CONSTRAINT `_FlowNodeDefinitionToFlowTemplate_B_fkey` FOREIGN KEY (`B`) REFERENCES `FlowTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
