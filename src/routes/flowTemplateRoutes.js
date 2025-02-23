const express = require("express");
const router = express.Router();
//const nodeDefinitionController = require("../controllers/nodeDefinitionController");
const { authenticateToken } = require("../middlewares/auth");
const checkPermission = require("../middlewares/checkPermission");
const flowTemplateController = require('../controllers/flowTemplateController');

/**
 * @swagger
 * components:
 *   schemas:
 *     NodeDefinition:
 *       type: object
 *       required:
 *         - definitionKey
 *         - name
 *         - category
 *         - nodeType
 *       properties:
 *         definitionKey:
 *           type: string
 *           description: 節點定義的唯一識別鍵值
 *           example: data-input
 *         nodeType:
 *           type: string
 *           description: 節點類型
 *           enum: [custom-input, custom-process, statistic-process]
 *           example: custom-input
 *         name:
 *           type: string
 *           description: 節點定義名稱
 *           example: 資料輸入節點
 *         category:
 *           type: string
 *           description: 節點定義分類
 *           example: business-input
 *         description:
 *           type: string
 *           description: 節點定義描述
 *           example: 用於輸入業務資料的節點
 *         version:
 *           type: string
 *           description: 版本號
 *           example: 1.0.0
 *         componentName:
 *           type: string
 *           description: Vue 組件名稱（custom-input 類型必填）
 *           example: DataInputNode
 *         apiEndpoint:
 *           type: string
 *           description: API 端點
 *           example: /data/input
 *         apiMethod:
 *           type: string
 *           description: API 方法
 *           enum: [GET, POST, PUT, DELETE]
 *           example: POST
 *         uiConfig:
 *           type: string
 *           description: UI 配置（JSON 字串）
 *         validationRules:
 *           type: string
 *           description: 驗證規則（JSON 字串）
 *         handles:
 *           type: string
 *           description: 節點連接點配置（JSON 字串）
 *     FlowTemplate:
 *       type: object
 *       required:
 *         - name
 *         - version
 *       properties:
 *         id:
 *           type: string
 *           description: 流程模板的唯一識別碼
 *           example: 1
 *         name:
 *           type: string
 *           description: 流程模板名稱
 *           example: 投訴處理流程
 *         description:
 *           type: string
 *           description: 流程模板描述
 *           example: 用於處理客戶投訴的標準流程
 *         version:
 *           type: string
 *           description: 版本號
 *           example: 1.0.0
 *         status:
 *           type: string
 *           description: 模板狀態
 *           enum: [active, inactive]
 *           example: active
 *         nodes:
 *           type: array
 *           description: 流程節點列表
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               type:
 *                 type: string
 *               position:
 *                 type: object
 *                 properties:
 *                   x:
 *                     type: number
 *                   y:
 *                     type: number
 *         edges:
 *           type: array
 *           description: 流程連線列表
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               source:
 *                 type: string
 *               target:
 *                 type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 創建時間
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新時間
 */

// 將 authenticateToken 中間件應用到所有路由
router.use(authenticateToken);

/**
 * @swagger
 * /api/flow-templates:
 *   get:
 *     summary: 獲取所有流程模板
 *     tags: [FlowTemplates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功獲取流程模板列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FlowTemplate'
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 */
router.get(
  '/',
  checkPermission(['VIEW_FLOW_TEMPLATES']),
  flowTemplateController.getAllTemplates
);

/**
 * @swagger
 * /api/flow-templates/{id}:
 *   get:
 *     summary: 獲取單個流程模板
 *     tags: [FlowTemplates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 流程模板ID
 *     responses:
 *       200:
 *         description: 成功獲取流程模板
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FlowTemplate'
 *       404:
 *         description: 流程模板不存在
 */
router.get(
  '/:id',
  checkPermission(['VIEW_FLOW_TEMPLATES']),
  flowTemplateController.getTemplateById
);

/**
 * @swagger
 * /api/flow-templates:
 *   post:
 *     summary: 創建流程模板
 *     tags: [FlowTemplates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FlowTemplate'
 *     responses:
 *       201:
 *         description: 流程模板創建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FlowTemplate'
 *       400:
 *         description: 請求資料驗證失敗
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 */
router.post(
  '/',
  checkPermission(['MANAGE_FLOW_TEMPLATES']),
  flowTemplateController.createTemplate
);

/**
 * @swagger
 * /api/flow-templates/{id}:
 *   put:
 *     summary: 更新流程模板
 *     tags: [FlowTemplates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 流程模板ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FlowTemplate'
 *     responses:
 *       200:
 *         description: 流程模板更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FlowTemplate'
 *       400:
 *         description: 請求資料驗證失敗
 *       404:
 *         description: 流程模板不存在
 */
router.put(
  '/:id',
  checkPermission(['MANAGE_FLOW_TEMPLATES']),
  flowTemplateController.updateTemplate
);

/**
 * @swagger
 * /api/flow-templates/{id}:
 *   delete:
 *     summary: 刪除流程模板
 *     tags: [FlowTemplates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 流程模板ID
 *     responses:
 *       200:
 *         description: 流程模板刪除成功
 *       404:
 *         description: 流程模板不存在
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 */
router.delete(
  '/:id',
  checkPermission(['MANAGE_FLOW_TEMPLATES']),
  flowTemplateController.deleteTemplate
);

/**
 * @swagger
 * /api/flow-templates/{id}/publish:
 *   put:
 *     summary: 發布流程模板
 *     tags: [FlowTemplates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 流程模板ID
 *     responses:
 *       200:
 *         description: 流程模板發布成功
 *       404:
 *         description: 流程模板不存在
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 */ 
router.put(
  '/:id/publish',
  checkPermission(['MANAGE_FLOW_TEMPLATES']),
  flowTemplateController.publishTemplate
);

module.exports = router; 