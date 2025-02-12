/*
  Warnings:

  - You are about to drop the column `filename` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `mimetype` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `path` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `files` table. All the data in the column will be lost.
  - Added the required column `fileName` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileSize` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileType` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileUrl` to the `files` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_files" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileName" TEXT NOT NULL,
    "originalname" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL,
    "thumbnailPath" TEXT,
    "workflowId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "files_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflows" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_files" (
    "id",
    "fileName",
    "originalname",
    "fileUrl",
    "fileSize",
    "fileType",
    "thumbnailPath",
    "workflowId",
    "status",
    "metadata",
    "createdAt",
    "updatedAt"
) 
SELECT 
    "id",
    "filename" as "fileName",
    "originalname",
    "path" as "fileUrl",
    "size" as "fileSize",
    "mimetype" as "fileType",
    "thumbnailPath",
    "workflowId",
    "status",
    "metadata",
    "createdAt",
    "updatedAt"
FROM "files";
DROP TABLE "files";
ALTER TABLE "new_files" RENAME TO "files";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
