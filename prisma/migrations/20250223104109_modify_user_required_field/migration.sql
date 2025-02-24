/*
  Warnings:

  - Made the column `createdBy` on table `FlowInstance` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedBy` on table `FlowInstance` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `FlowInstance` DROP FOREIGN KEY `FlowInstance_createdBy_fkey`;

-- DropForeignKey
ALTER TABLE `FlowInstance` DROP FOREIGN KEY `FlowInstance_updatedBy_fkey`;

-- AlterTable
ALTER TABLE `FlowInstance` MODIFY `createdBy` VARCHAR(191) NOT NULL,
    MODIFY `updatedBy` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `FlowInstance` ADD CONSTRAINT `FlowInstance_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FlowInstance` ADD CONSTRAINT `FlowInstance_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
