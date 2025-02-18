/*
  Warnings:

  - You are about to drop the column `defaultConfig` on the `NodeDefinition` table. All the data in the column will be lost.
  - You are about to drop the column `icon` on the `NodeDefinition` table. All the data in the column will be lost.
  - You are about to drop the column `inputSchema` on the `NodeDefinition` table. All the data in the column will be lost.
  - You are about to drop the column `outputSchema` on the `NodeDefinition` table. All the data in the column will be lost.
  - You are about to drop the column `typeKey` on the `NodeDefinition` table. All the data in the column will be lost.
  - You are about to drop the column `uiSchema` on the `NodeDefinition` table. All the data in the column will be lost.
  - You are about to drop the column `validationRules` on the `NodeDefinition` table. All the data in the column will be lost.
  - Added the required column `definitionKey` to the `NodeDefinition` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NodeDefinition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "definitionKey" TEXT NOT NULL,
    "nodeType" TEXT NOT NULL DEFAULT 'custom-process',
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "componentName" TEXT,
    "version" TEXT NOT NULL,
    "apiEndpoint" TEXT,
    "apiMethod" TEXT,
    "config" TEXT NOT NULL DEFAULT '{}',
    "uiConfig" TEXT NOT NULL DEFAULT '{}',
    "validation" TEXT NOT NULL DEFAULT '{}',
    "handles" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_NodeDefinition" ("apiEndpoint", "apiMethod", "category", "componentName", "createdAt", "description", "handles", "id", "name", "uiConfig", "updatedAt", "version") SELECT "apiEndpoint", "apiMethod", "category", "componentName", "createdAt", "description", "handles", "id", "name", "uiConfig", "updatedAt", "version" FROM "NodeDefinition";
DROP TABLE "NodeDefinition";
ALTER TABLE "new_NodeDefinition" RENAME TO "NodeDefinition";
CREATE UNIQUE INDEX "NodeDefinition_definitionKey_key" ON "NodeDefinition"("definitionKey");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
