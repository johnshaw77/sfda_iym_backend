/*
  Warnings:

  - Added the required column `nodeDefinitionId` to the `NodeInstance` table without a default value. This is not possible if the table is not empty.

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
    "componentPath" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "apiEndpoint" TEXT,
    "apiMethod" TEXT,
    "config" TEXT NOT NULL DEFAULT '{}',
    "uiConfig" TEXT NOT NULL DEFAULT '{}',
    "validation" TEXT NOT NULL DEFAULT '{}',
    "handles" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_NodeDefinition" ("apiEndpoint", "apiMethod", "category", "componentName", "config", "createdAt", "definitionKey", "description", "handles", "id", "name", "nodeType", "uiConfig", "updatedAt", "validation", "version") SELECT "apiEndpoint", "apiMethod", "category", "componentName", "config", "createdAt", "definitionKey", "description", "handles", "id", "name", "nodeType", "uiConfig", "updatedAt", "validation", "version" FROM "NodeDefinition";
DROP TABLE "NodeDefinition";
ALTER TABLE "new_NodeDefinition" RENAME TO "NodeDefinition";
CREATE UNIQUE INDEX "NodeDefinition_definitionKey_key" ON "NodeDefinition"("definitionKey");
CREATE TABLE "new_NodeInstance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workflowInstanceId" TEXT NOT NULL,
    "nodeTemplateId" TEXT NOT NULL,
    "nodeDefinitionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startTime" DATETIME,
    "endTime" DATETIME,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NodeInstance_workflowInstanceId_fkey" FOREIGN KEY ("workflowInstanceId") REFERENCES "WorkflowInstance" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "NodeInstance_nodeTemplateId_fkey" FOREIGN KEY ("nodeTemplateId") REFERENCES "NodeTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "NodeInstance_nodeDefinitionId_fkey" FOREIGN KEY ("nodeDefinitionId") REFERENCES "NodeDefinition" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_NodeInstance" ("createdAt", "endTime", "errorMessage", "id", "nodeTemplateId", "retryCount", "startTime", "status", "updatedAt", "workflowInstanceId") SELECT "createdAt", "endTime", "errorMessage", "id", "nodeTemplateId", "retryCount", "startTime", "status", "updatedAt", "workflowInstanceId" FROM "NodeInstance";
DROP TABLE "NodeInstance";
ALTER TABLE "new_NodeInstance" RENAME TO "NodeInstance";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
