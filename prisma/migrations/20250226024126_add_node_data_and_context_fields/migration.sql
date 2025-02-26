-- AlterTable
ALTER TABLE `FlowInstance` ADD COLUMN `nodeContext` JSON NULL,
    ADD COLUMN `nodeData` JSON NULL;
