/** !TODO: Remove this file */
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  handleFileUpload,
  getFileInfo,
  deleteFile,
  processFile,
} = require("../controllers/fileController");
const { authenticateToken } = require("../middlewares/auth");
const { upload } = require("../middlewares/upload");

// 配置 multer 存儲
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // 記錄原始檔案資訊
    console.log("Multer 收到的檔案資訊：", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      encoding: file.encoding,
      fieldname: file.fieldname,
    });

    // 保持原始檔案名，但添加時間戳以避免衝突
    const timestamp = Date.now();
    const originalName = Buffer.from(file.originalname, "latin1").toString(
      "utf8"
    );
    console.log("轉換後的檔案名latin1：", originalName);

    const filename = `${timestamp}-${originalName}`;
    console.log("最終的檔案名：", filename);
    cb(null, filename);
  },
});

const uploadMulter = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 限制 10MB
  },
  fileFilter: (req, file, cb) => {
    // 允許的檔案類型
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      // PPT 相關
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/powerpoint",
      "application/mspowerpoint",
      "application/x-mspowerpoint",
      "application/ppt",
      // Excel 相關
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/excel",
      "application/x-excel",
      "application/x-msexcel",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("不支援的檔案類型"));
    }
  },
});

/**
 * @swagger
 * tags:
 *   name: 檔案管理
 *   description: 檔案上傳、下載、刪除等功能
 */

// 所有路由都需要認證
router.use(authenticateToken);

/**
 * @swagger
 * /api/files/upload:
 *   post:
 *     tags: [檔案管理]
 *     summary: 上傳一般檔案
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: 檔案上傳成功
 */
router.post("/upload", uploadMulter.single("file"), handleFileUpload);

/**
 * @swagger
 * /api/files/upload/workflow:
 *   post:
 *     tags: [檔案管理]
 *     summary: 上傳工作流程檔案
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               workflowId:
 *                 type: string
 *     responses:
 *       200:
 *         description: 檔案上傳成功
 */
router.post("/upload/workflow", uploadMulter.single("file"), handleFileUpload);

/**
 * @swagger
 * /api/files/{fileId}:
 *   get:
 *     tags: [檔案管理]
 *     summary: 獲取檔案資訊
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功獲取檔案資訊
 */
router.get("/:fileId", getFileInfo);

/**
 * @swagger
 * /api/files/{fileId}/download:
 *   get:
 *     tags: [檔案管理]
 *     summary: 下載檔案
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 檔案下載成功
 */
router.get("/:fileId/download", handleFileUpload);

/**
 * @swagger
 * /api/files/{fileId}:
 *   delete:
 *     tags: [檔案管理]
 *     summary: 刪除檔案
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 檔案刪除成功
 */
router.delete("/:fileId", deleteFile);

module.exports = router;
