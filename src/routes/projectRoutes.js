const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const { authenticateToken } = require("../middlewares/auth");

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: 專案唯一識別碼
 *         name:
 *           type: string
 *           description: 專案名稱
 *         description:
 *           type: string
 *           description: 專案描述
 *         status:
 *           type: string
 *           enum: [draft, active, completed]
 *           description: 專案狀態
 *         createdBy:
 *           type: string
 *           description: 創建者ID
 *         updatedBy:
 *           type: string
 *           description: 最後更新者ID
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
 *   name: Projects
 *   description: 專案管理相關 API
 */

/**
 * @swagger
 * /api/projects:
 *   post:
 *     tags: [Projects]
 *     summary: 創建新專案
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: 專案名稱
 *               description:
 *                 type: string
 *                 description: 專案描述
 *               status:
 *                 type: string
 *                 enum: [draft, active, completed]
 *                 default: draft
 *                 description: 專案狀態
 *     responses:
 *       201:
 *         description: 專案創建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 project:
 *                   $ref: '#/components/schemas/Project'
 */
router.post("/", authenticateToken, projectController.createProject);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     tags: [Projects]
 *     summary: 獲取所有專案
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: includeWorkflows
 *         schema:
 *           type: boolean
 *         description: 是否包含工作流程實例資訊
 *     responses:
 *       200:
 *         description: 成功獲取專案列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 */
router.get("/", authenticateToken, projectController.getAllProjects);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     tags: [Projects]
 *     summary: 獲取單個專案詳情
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: includeWorkflows
 *         schema:
 *           type: boolean
 *         description: 是否包含工作流程實例資訊
 *     responses:
 *       200:
 *         description: 成功獲取專案詳情
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 */
router.get("/:id", authenticateToken, projectController.getProjectById);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     tags: [Projects]
 *     summary: 更新專案
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
 *               name:
 *                 type: string
 *                 description: 專案名稱
 *               description:
 *                 type: string
 *                 description: 專案描述
 *               status:
 *                 type: string
 *                 enum: [draft, active, completed]
 *                 description: 專案狀態
 *     responses:
 *       200:
 *         description: 專案更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 project:
 *                   $ref: '#/components/schemas/Project'
 */
router.put("/:id", authenticateToken, projectController.updateProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     tags: [Projects]
 *     summary: 刪除專案
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
 *         description: 專案刪除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.delete("/:id", authenticateToken, projectController.deleteProject);

module.exports = router;
