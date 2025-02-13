const sharp = require("sharp");
const path = require("path");
const fs = require("fs").promises;
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class FileProcessingService {
  /**
   * 處理上傳的檔案
   * @param {Object} file - 上傳的檔案對象
   * @param {string} workflowId - 工作流程ID
   * @returns {Promise<Object>} - 處理後的檔案資訊
   */
  async processUploadedFile(file, workflowId = null) {
    try {
      const fileInfo = {
        fileName: file.filename,
        originalname: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        fileSize: file.size,
        fileType: file.mimetype,
        workflowId: workflowId,
        status: "processing",
      };

      // 如果是圖片，生成縮圖
      if (file.mimetype.startsWith("image/")) {
        const thumbnailName = `thumb_${file.filename}`;
        const thumbnailPath = path.join(
          process.env.UPLOAD_DIR || "uploads",
          thumbnailName
        );

        await this.generateThumbnail(file.path, thumbnailPath);
        fileInfo.thumbnailPath = `/uploads/${thumbnailName}`;
      }

      // 更新檔案狀態為已完成
      fileInfo.status = "completed";

      return fileInfo;
    } catch (error) {
      console.error("檔案處理錯誤:", error);
      throw new Error("檔案處理失敗");
    }
  }

  /**
   * 生成圖片縮圖
   * @param {string} sourcePath - 原始圖片路徑
   * @param {string} targetPath - 目標縮圖路徑
   * @returns {Promise<void>}
   */
  async generateThumbnail(sourcePath, targetPath) {
    try {
      await sharp(sourcePath)
        .resize(200, 200, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({
          quality: 80,
          progressive: true,
        })
        .toFile(targetPath);
    } catch (error) {
      console.error("縮圖生成錯誤:", error);
      throw new Error("縮圖生成失敗");
    }
  }

  /**
   * 刪除檔案及其相關資源
   * @param {string} fileId - 檔案ID
   * @returns {Promise<void>}
   */
  async deleteFile(fileId) {
    try {
      const file = await prisma.file.findUnique({
        where: { id: fileId },
      });

      if (!file) {
        throw new Error("檔案不存在");
      }

      // 刪除實體檔案
      const filePath = path.join(
        process.env.UPLOAD_DIR || "uploads",
        path.basename(file.fileUrl)
      );
      await fs.unlink(filePath);

      // 如果有縮圖，也要刪除
      if (file.thumbnailPath) {
        const thumbnailPath = path.join(
          process.env.UPLOAD_DIR || "uploads",
          path.basename(file.thumbnailPath)
        );
        await fs.unlink(thumbnailPath).catch(() => {});
      }

      // 從資料庫中刪除記錄
      await prisma.file.delete({
        where: { id: fileId },
      });
    } catch (error) {
      console.error("檔案刪除錯誤:", error);
      throw new Error("檔案刪除失敗");
    }
  }

  /**
   * 更新檔案元數據
   * @param {string} fileId - 檔案ID
   * @param {Object} metadata - 元數據對象
   * @returns {Promise<Object>} - 更新後的檔案資訊
   */
  async updateFileMetadata(fileId, metadata) {
    try {
      const updatedFile = await prisma.file.update({
        where: { id: fileId },
        data: {
          metadata: JSON.stringify(metadata),
        },
      });

      return updatedFile;
    } catch (error) {
      console.error("更新檔案元數據錯誤:", error);
      throw new Error("更新檔案元數據失敗");
    }
  }

  /**
   * 批量處理檔案
   * @param {Array<Object>} files - 檔案對象數組
   * @param {string} workflowId - 工作流程ID
   * @returns {Promise<Array<Object>>} - 處理後的檔案資訊數組
   */
  async processBatchFiles(files, workflowId = null) {
    try {
      const processedFiles = await Promise.all(
        files.map((file) => this.processUploadedFile(file, workflowId))
      );

      return processedFiles;
    } catch (error) {
      console.error("批量處理檔案錯誤:", error);
      throw new Error("批量處理檔案失敗");
    }
  }

  /**
   * 檢查檔案狀態
   * @param {string} fileId - 檔案ID
   * @returns {Promise<Object>} - 檔案狀態資訊
   */
  async checkFileStatus(fileId) {
    try {
      const file = await prisma.file.findUnique({
        where: { id: fileId },
      });

      if (!file) {
        throw new Error("檔案不存在");
      }

      return {
        id: file.id,
        status: file.status,
        updatedAt: file.updatedAt,
      };
    } catch (error) {
      console.error("檢查檔案狀態錯誤:", error);
      throw new Error("檢查檔案狀態失敗");
    }
  }
}

module.exports = new FileProcessingService();
