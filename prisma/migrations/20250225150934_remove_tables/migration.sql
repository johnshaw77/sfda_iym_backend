/*
  Warnings:

  - You are about to drop the column `workflowInstanceId` on the `FileNode` table. All the data in the column will be lost.
  - You are about to drop the `File` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NodeDefinition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NodeInstance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NodeInstanceConnection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NodeTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NodeTemplateConnection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Workflow` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkflowInstance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkflowTemplate` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `flowInstanceId` to the `FileNode` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `DataSnapshot` DROP FOREIGN KEY `DataSnapshot_nodeInstanceId_fkey`;

-- DropForeignKey
ALTER TABLE `File` DROP FOREIGN KEY `File_workflowId_fkey`;

-- DropForeignKey
ALTER TABLE `FileNode` DROP FOREIGN KEY `FileNode_workflowInstanceId_fkey`;

-- DropForeignKey
ALTER TABLE `NodeInstance` DROP FOREIGN KEY `NodeInstance_nodeDefinitionId_fkey`;

-- DropForeignKey
ALTER TABLE `NodeInstance` DROP FOREIGN KEY `NodeInstance_nodeTemplateId_fkey`;

-- DropForeignKey
ALTER TABLE `NodeInstance` DROP FOREIGN KEY `NodeInstance_workflowInstanceId_fkey`;

-- DropForeignKey
ALTER TABLE `NodeInstanceConnection` DROP FOREIGN KEY `NodeInstanceConnection_sourceNodeId_fkey`;

-- DropForeignKey
ALTER TABLE `NodeInstanceConnection` DROP FOREIGN KEY `NodeInstanceConnection_targetNodeId_fkey`;

-- DropForeignKey
ALTER TABLE `NodeInstanceConnection` DROP FOREIGN KEY `NodeInstanceConnection_templateConnectionId_fkey`;

-- DropForeignKey
ALTER TABLE `NodeInstanceConnection` DROP FOREIGN KEY `NodeInstanceConnection_workflowInstanceId_fkey`;

-- DropForeignKey
ALTER TABLE `NodeTemplate` DROP FOREIGN KEY `NodeTemplate_nodeTypeId_fkey`;

-- DropForeignKey
ALTER TABLE `NodeTemplate` DROP FOREIGN KEY `NodeTemplate_workflowTemplateId_fkey`;

-- DropForeignKey
ALTER TABLE `NodeTemplateConnection` DROP FOREIGN KEY `NodeTemplateConnection_sourceNodeId_fkey`;

-- DropForeignKey
ALTER TABLE `NodeTemplateConnection` DROP FOREIGN KEY `NodeTemplateConnection_targetNodeId_fkey`;

-- DropForeignKey
ALTER TABLE `NodeTemplateConnection` DROP FOREIGN KEY `NodeTemplateConnection_workflowTemplateId_fkey`;

-- DropForeignKey
ALTER TABLE `Workflow` DROP FOREIGN KEY `Workflow_createdBy_fkey`;

-- DropForeignKey
ALTER TABLE `Workflow` DROP FOREIGN KEY `Workflow_updatedBy_fkey`;

-- DropForeignKey
ALTER TABLE `WorkflowInstance` DROP FOREIGN KEY `WorkflowInstance_initiator_fkey`;

-- DropForeignKey
ALTER TABLE `WorkflowInstance` DROP FOREIGN KEY `WorkflowInstance_projectId_fkey`;

-- DropForeignKey
ALTER TABLE `WorkflowInstance` DROP FOREIGN KEY `WorkflowInstance_templateId_fkey`;

-- DropForeignKey
ALTER TABLE `WorkflowTemplate` DROP FOREIGN KEY `WorkflowTemplate_createdBy_fkey`;

-- AlterTable
ALTER TABLE `FileNode` DROP COLUMN `workflowInstanceId`,
    ADD COLUMN `flowInstanceId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `FlowInstance` ADD COLUMN `endedAt` DATETIME(3) NULL,
    ADD COLUMN `error` VARCHAR(191) NULL,
    ADD COLUMN `lastNodeId` VARCHAR(191) NULL,
    ADD COLUMN `logs` JSON NULL,
    ADD COLUMN `nodeStates` JSON NULL,
    ADD COLUMN `pausedAt` DATETIME(3) NULL,
    ADD COLUMN `startedAt` DATETIME(3) NULL;

-- DropTable
DROP TABLE `File`;

-- DropTable
DROP TABLE `NodeDefinition`;

-- DropTable
DROP TABLE `NodeInstance`;

-- DropTable
DROP TABLE `NodeInstanceConnection`;

-- DropTable
DROP TABLE `NodeTemplate`;

-- DropTable
DROP TABLE `NodeTemplateConnection`;

-- DropTable
DROP TABLE `Workflow`;

-- DropTable
DROP TABLE `WorkflowInstance`;

-- DropTable
DROP TABLE `WorkflowTemplate`;

-- CreateIndex
CREATE INDEX `FlowInstance_status_idx` ON `FlowInstance`(`status`);

-- AddForeignKey
ALTER TABLE `FileNode` ADD CONSTRAINT `FileNode_flowInstanceId_fkey` FOREIGN KEY (`flowInstanceId`) REFERENCES `FlowInstance`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `FlowInstance` RENAME INDEX `FlowInstance_createdBy_fkey` TO `FlowInstance_createdBy_idx`;

-- RenameIndex
ALTER TABLE `FlowInstance` RENAME INDEX `FlowInstance_projectId_fkey` TO `FlowInstance_projectId_idx`;

-- RenameIndex
ALTER TABLE `FlowInstance` RENAME INDEX `FlowInstance_templateId_fkey` TO `FlowInstance_templateId_idx`;
