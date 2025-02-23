/*
  Warnings:

  - You are about to alter the column `category` on the `FlowNodeDefinition` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(150)`.
  - You are about to alter the column `name` on the `FlowNodeDefinition` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(150)`.
  - You are about to alter the column `componentName` on the `FlowNodeDefinition` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(150)`.
  - You are about to alter the column `componentPath` on the `FlowNodeDefinition` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(150)`.
  - You are about to alter the column `name` on the `FlowTemplate` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(150)`.
  - You are about to alter the column `type` on the `FlowTemplate` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `version` on the `FlowTemplate` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.

*/
-- DropForeignKey
ALTER TABLE `FlowDocument` DROP FOREIGN KEY `FlowDocument_createdBy_fkey`;

-- DropForeignKey
ALTER TABLE `FlowInstance` DROP FOREIGN KEY `FlowInstance_createdBy_fkey`;

-- DropForeignKey
ALTER TABLE `FlowInstance` DROP FOREIGN KEY `FlowInstance_updatedBy_fkey`;

-- AlterTable
ALTER TABLE `FlowDocument` MODIFY `createdBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `FlowInstance` MODIFY `createdBy` VARCHAR(191) NULL,
    MODIFY `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `FlowNodeDefinition` MODIFY `category` VARCHAR(150) NOT NULL,
    MODIFY `name` VARCHAR(150) NOT NULL,
    MODIFY `description` VARCHAR(255) NOT NULL,
    MODIFY `componentName` VARCHAR(150) NOT NULL,
    MODIFY `componentPath` VARCHAR(150) NULL;

-- AlterTable
ALTER TABLE `FlowTemplate` MODIFY `name` VARCHAR(150) NOT NULL,
    MODIFY `type` VARCHAR(50) NOT NULL,
    MODIFY `version` VARCHAR(20) NOT NULL,
    MODIFY `description` VARCHAR(255) NOT NULL;

-- AddForeignKey
ALTER TABLE `FlowInstance` ADD CONSTRAINT `FlowInstance_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FlowInstance` ADD CONSTRAINT `FlowInstance_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FlowDocument` ADD CONSTRAINT `FlowDocument_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
