-- DropForeignKey
ALTER TABLE `FlowTemplate` DROP FOREIGN KEY `FlowTemplate_createdBy_fkey`;

-- DropForeignKey
ALTER TABLE `FlowTemplate` DROP FOREIGN KEY `FlowTemplate_updatedBy_fkey`;

-- AlterTable
ALTER TABLE `FlowNodeDefinition` ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `FlowTemplate` MODIFY `createdBy` VARCHAR(191) NULL,
    MODIFY `updatedBy` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `FlowNodeDefinition` ADD CONSTRAINT `FlowNodeDefinition_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FlowNodeDefinition` ADD CONSTRAINT `FlowNodeDefinition_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FlowTemplate` ADD CONSTRAINT `FlowTemplate_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FlowTemplate` ADD CONSTRAINT `FlowTemplate_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
