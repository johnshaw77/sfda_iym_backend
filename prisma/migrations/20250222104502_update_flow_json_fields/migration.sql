/*
  Warnings:

  - You are about to alter the column `metadata` on the `FlowDocument` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `context` on the `FlowInstance` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `nodes` on the `FlowInstance` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `edges` on the `FlowInstance` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `config` on the `FlowNodeDefinition` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `uiConfig` on the `FlowNodeDefinition` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `handles` on the `FlowNodeDefinition` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `nodes` on the `FlowTemplate` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `edges` on the `FlowTemplate` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `metadata` on the `FlowTemplate` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.

*/
-- AlterTable
ALTER TABLE `FlowDocument` MODIFY `metadata` JSON NULL;

-- AlterTable
ALTER TABLE `FlowInstance` MODIFY `context` JSON NOT NULL DEFAULT (JSON_OBJECT()),
    MODIFY `nodes` JSON NOT NULL DEFAULT (JSON_ARRAY()),
    MODIFY `edges` JSON NOT NULL DEFAULT (JSON_ARRAY());

-- AlterTable
ALTER TABLE `FlowNodeDefinition` MODIFY `config` JSON NOT NULL DEFAULT (JSON_OBJECT()),
    MODIFY `uiConfig` JSON NOT NULL DEFAULT (JSON_OBJECT()),
    MODIFY `handles` JSON NOT NULL DEFAULT (JSON_OBJECT());

-- AlterTable
ALTER TABLE `FlowTemplate` MODIFY `nodes` JSON NOT NULL DEFAULT (JSON_ARRAY()),
    MODIFY `edges` JSON NOT NULL DEFAULT (JSON_ARRAY()),
    MODIFY `metadata` JSON NULL;
