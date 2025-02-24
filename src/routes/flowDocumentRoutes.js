const express = require("express");
const router = express.Router();
const multer = require("multer");
const flowDocumentController = require("../controllers/flowDocumentController");
const { authenticateToken } = require("../middlewares/auth");

// 配置 multer 存儲
const storage = multer.diskStorage({
  // 設定上傳路徑
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

// 所有路由都需要驗證
router.use(authenticateToken);

// 取得所有文檔
/**
 * @swagger
 * /api/flow-documents:
 *   get:
 *     summary: 取得所有文檔
 *     description: 取得所有文檔
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Flow Documents
 *     responses:
 *       200:
 *         description: 成功取得所有文檔
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FlowDocument'
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 */
router.get("/", flowDocumentController.getAllDocuments);

/**
 * @swagger
 * /api/flow-documents/project/{projectId}:
 *   get:
 *     summary: 根據專案 ID 取得文檔
 *     description: 根據專案 ID 取得文檔
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Flow Documents
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         description: 專案 ID
 *     responses:
 *       200:
 *         description: 成功取得專案文檔
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FlowDocument'
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 */
router.get("/project/:projectId", flowDocumentController.getDocumentsByProject);

/**
 * @swagger
 * /api/flow-documents/instance/{instanceId}:
 *   get:
 *     summary: 根據實例 ID 取得文檔
 *     description: 根據實例 ID 取得文檔
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Flow Documents
 *     parameters:
 *       - in: path
 *         name: instanceId
 *         schema:
 *           type: string
 *         description: 實例 ID
 *     responses:
 *       200:
 *         description: 成功取得實例文檔
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FlowDocument'
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 */
router.get(
  "/instance/:instanceId",
  flowDocumentController.getDocumentsByInstance
);

/**
 * @swagger
 * /api/flow-documents/{id}:
 *   get:
 *     summary: 取得單一文檔
 *     description: 取得單一文檔
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Flow Documents
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         description: 文檔 ID
 *     responses:
 *       200:
 *         description: 成功取得文檔
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FlowDocument'
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 */
router.get("/:id", flowDocumentController.getDocumentById);

/**
 * @swagger
 * /api/flow-documents/upload:
 *   post:
 *     summary: 上傳文檔
 *     description: 上傳文檔
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Flow Documents
 *     responses:
 *       200:
 *         description: 成功上傳文檔
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FlowDocument'
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 */
router.post(
  "/upload",
  uploadMulter.single("file"),
  flowDocumentController.uploadDocument
);

/**
 * @swagger
 * /api/flow-documents/{id}:
 *   put:
 *     summary: 更新文檔資訊
 *     description: 更新文檔資訊
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Flow Documents
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         description: 文檔 ID
 *     responses:
 *       200:
 *         description: 成功更新文檔資訊
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FlowDocument'
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 */
router.put("/:id", flowDocumentController.updateDocument);

/**
 * @swagger
 * /api/flow-documents/{id}:
 *   delete:
 *     summary: 刪除文檔
 *     description: 刪除文檔
 */
router.delete("/:id", flowDocumentController.deleteDocument);

module.exports = router;
