/*
  Warnings:

  - Added the required column `projectNumber` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `systemCode` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- 創建管理員用戶
INSERT INTO "User" (
    "id",
    "username",
    "email",
    "password",
    "role",
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'admin',
    'admin@example.com',
    '$2a$10$K4AGv.Rp0vRZbHU.0LWpb.YRlAXXY7GOXfFqTAo1ymQIJLXcz4f6.',  -- 密碼：admin123
    'ADMIN',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SystemCode" (
    "systemCode" TEXT NOT NULL PRIMARY KEY,
    "systemName" TEXT NOT NULL,
    "systemDescription" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    CONSTRAINT "SystemCode_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SystemCode_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 插入初始系統代碼
INSERT INTO "SystemCode" ("systemCode", "systemName", "systemDescription", "isEnabled", "createdAt", "updatedAt", "createdBy", "updatedBy")
VALUES 
    ('IYM', '量測系統', 'In-line Yield Management System', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000');

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectNumber" TEXT NOT NULL,
    "systemCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Project_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Project_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Project_systemCode_fkey" FOREIGN KEY ("systemCode") REFERENCES "SystemCode" ("systemCode") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 將現有專案資料遷移到新表，並為其生成 projectNumber
INSERT INTO "new_Project" (
    "id", 
    "projectNumber",
    "systemCode",
    "name", 
    "description", 
    "status", 
    "createdBy", 
    "updatedBy", 
    "createdAt", 
    "updatedAt"
)
SELECT 
    "id",
    'IYM_' || strftime('%Y%m%d_%H%M%S', "createdAt") || '_' || substr(hex(randomblob(3)), 1, 5) as "projectNumber",
    'IYM' as "systemCode",
    "name",
    "description",
    "status",
    "createdBy",
    "updatedBy",
    "createdAt",
    "updatedAt"
FROM "Project";

DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_projectNumber_key" ON "Project"("projectNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
