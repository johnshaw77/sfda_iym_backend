/*
  Warnings:

  - You are about to alter the column `icon` on the `FlowNodeDefinition` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.

*/
-- AlterTable
ALTER TABLE `FlowNodeDefinition` MODIFY `icon` VARCHAR(50) NULL;
