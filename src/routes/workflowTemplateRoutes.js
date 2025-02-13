const express = require("express");
const router = express.Router();
const workflowTemplateController = require("../controllers/workflowTemplateController");
const { authenticateToken, authorizeAdmin } = require("../middlewares/auth");

/**
 * @swagger
 * components:
 *   schemas:
 *     WorkflowTemplate:
 *       type: object
 *       required:
 *         - templateName
 *         - templateCategory
 *         - version
 *       properties:
 *         id:
 *           type: string
 *           description: 範本唯一識別碼
 *         templateName:
 *           type: string
 *           description: 範本名稱
 *         templateCategory:
 *           type: string
 *           description: 範本分類
 *         description:
 *           type: string
 *           description: 範本描述
 *         version:
 *           type: string
 *           description: 版本號
 *         status:
 *           type: string
 *           enum: [draft, published, deprecated]
 *           description: 範本狀態
 *         config:
 *           type: object
 *           description: 範本配置
 *         createdBy:
 *           type: string
 *           description: 創建者ID
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 創建時間
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新時間
 */

/**
 * @swagger
 * tags:
 *   name: WorkflowTemplates
 *   description: 工作流程範本管理 API
 */

/**
 * @swagger
 * /api/workflow-templates:
 *   post:
 *     tags: [WorkflowTemplates]
 *     summary: 創建新範本
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - templateName
 *               - templateCategory
 *               - version
 *             properties:
 *               templateName:
 *                 type: string
 *               templateCategory:
 *                 type: string
 *               description:
 *                 type: string
 *               version:
 *                 type: string
 *               config:
 *                 type: object
 *     responses:
 *       201:
 *         description: 範本創建成功
 */
router.post(
  "/",
  authenticateToken,
  authorizeAdmin,
  workflowTemplateController.createTemplate
);

/**
 * @swagger
 * /api/workflow-templates:
 *   get:
 *     tags: [WorkflowTemplates]
 *     summary: 獲取範本列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 按分類篩選
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: 按狀態篩選
 *     responses:
 *       200:
 *         description: 成功獲取範本列表
 */
router.get(
  "/",
  authenticateToken,
  authorizeAdmin,
  workflowTemplateController.getTemplates
);

/**
 * @swagger
 * /api/workflow-templates/{id}:
 *   get:
 *     tags: [WorkflowTemplates]
 *     summary: 獲取範本詳情
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功獲取範本詳情
 */
router.get(
  "/:id",
  authenticateToken,
  authorizeAdmin,
  workflowTemplateController.getTemplateById
);

/**
 * @swagger
 * /api/workflow-templates/{id}:
 *   put:
 *     tags: [WorkflowTemplates]
 *     summary: 更新範本
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               templateName:
 *                 type: string
 *               templateCategory:
 *                 type: string
 *               description:
 *                 type: string
 *               version:
 *                 type: string
 *               config:
 *                 type: object
 *     responses:
 *       200:
 *         description: 範本更新成功
 */
router.put(
  "/:id",
  authenticateToken,
  authorizeAdmin,
  workflowTemplateController.updateTemplate
);

/**
 * @swagger
 * /api/workflow-templates/{id}:
 *   delete:
 *     tags: [WorkflowTemplates]
 *     summary: 刪除範本
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 範本刪除成功
 */
router.delete(
  "/:id",
  authenticateToken,
  authorizeAdmin,
  workflowTemplateController.deleteTemplate
);

/**
 * @swagger
 * /api/workflow-templates/{id}/publish:
 *   put:
 *     tags: [WorkflowTemplates]
 *     summary: 發布範本
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 範本發布成功
 */
router.put(
  "/:id/publish",
  authenticateToken,
  authorizeAdmin,
  workflowTemplateController.publishTemplate
);

/**
 * @swagger
 * /api/workflow-templates/{id}/deprecate:
 *   put:
 *     tags: [WorkflowTemplates]
 *     summary: 棄用範本
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 範本棄用成功
 */
router.put(
  "/:id/deprecate",
  authenticateToken,
  authorizeAdmin,
  workflowTemplateController.deprecateTemplate
);

module.exports = router;
