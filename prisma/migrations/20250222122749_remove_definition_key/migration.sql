/*
  Warnings:

  - You are about to drop the column `definitionKey` on the `FlowNodeDefinition` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `FlowNodeDefinition_definitionKey_key` ON `FlowNodeDefinition`;

-- AlterTable
ALTER TABLE `FlowNodeDefinition` DROP COLUMN `definitionKey`;
