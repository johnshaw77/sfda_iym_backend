/*
  Warnings:

  - You are about to drop the `NodeType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "NodeType_typeKey_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "NodeType";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "NodeDefinition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "typeKey" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "componentName" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "defaultConfig" TEXT NOT NULL DEFAULT '{}',
    "apiEndpoint" TEXT,
    "apiMethod" TEXT,
    "inputSchema" TEXT NOT NULL DEFAULT '{}',
    "outputSchema" TEXT NOT NULL DEFAULT '{}',
    "uiSchema" TEXT NOT NULL DEFAULT '{}',
    "icon" TEXT,
    "uiConfig" TEXT NOT NULL DEFAULT '{}',
    "validationRules" TEXT NOT NULL DEFAULT '{}',
    "handles" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NodeTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workflowTemplateId" TEXT NOT NULL,
    "nodeTypeId" TEXT NOT NULL,
    "nodeName" TEXT NOT NULL,
    "positionX" INTEGER NOT NULL,
    "positionY" INTEGER NOT NULL,
    "config" TEXT,
    "style" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NodeTemplate_workflowTemplateId_fkey" FOREIGN KEY ("workflowTemplateId") REFERENCES "WorkflowTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "NodeTemplate_nodeTypeId_fkey" FOREIGN KEY ("nodeTypeId") REFERENCES "NodeDefinition" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_NodeTemplate" ("config", "createdAt", "id", "nodeName", "nodeTypeId", "positionX", "positionY", "style", "updatedAt", "workflowTemplateId") SELECT "config", "createdAt", "id", "nodeName", "nodeTypeId", "positionX", "positionY", "style", "updatedAt", "workflowTemplateId" FROM "NodeTemplate";
DROP TABLE "NodeTemplate";
ALTER TABLE "new_NodeTemplate" RENAME TO "NodeTemplate";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "NodeDefinition_typeKey_key" ON "NodeDefinition"("typeKey");
