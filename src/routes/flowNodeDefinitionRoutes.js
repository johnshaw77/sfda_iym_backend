const express = require("express");
const router = express.Router();
const flowNodeDefinitionController = require("../controllers/flowNodeDefinitionController");
const { authenticateToken } = require("../middlewares/auth");
const checkPermission = require("../middlewares/checkPermission");

/**
 * @swagger
 * components:
 *   schemas:
 *     FlowNodeDefinition:
 *       type: object
 *       required:
 *         - name
 *         - type
 *       properties:
 *         id:
 *           type: string
 *           description: 節點定義的唯一識別碼
 *           example: 1
 *         name:
 *           type: string
 *           description: 節點定義名稱
 *           example: 資料輸入節點
 *         type:
 *           type: string
 *           description: 節點類型
 *           enum: [input, process, output]
 *           example: input
 *         description:
 *           type: string
 *           description: 節點定義描述
 *           example: 用於輸入業務資料的節點
 *         config:
 *           type: object
 *           description: 節點配置
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
 * /api/flow-node-definitions:
 *   get:
 *     summary: 獲取所有流程節點定義
 *     tags: [FlowNodeDefinitions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功獲取流程節點定義列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FlowNodeDefinition'
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 */
router.get(
  '/',
  checkPermission(['VIEW_FLOW_NODE_DEFINITIONS']),
  flowNodeDefinitionController.getAllNodeDefinitions
);

/**
 * @swagger
 * /api/flow-node-definitions/{id}:
 *   get:
 *     summary: 獲取單個流程節點定義
 *     tags: [FlowNodeDefinitions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 流程節點定義ID
 *     responses:
 *       200:
 *         description: 成功獲取流程節點定義
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FlowNodeDefinition'
 *       404:
 *         description: 流程節點定義不存在
 */
router.get(
  '/:id',
  checkPermission(['VIEW_FLOW_NODE_DEFINITIONS']),
  flowNodeDefinitionController.getNodeDefinitionById
);

/**
 * @swagger
 * /api/flow-node-definitions:
 *   post:
 *     summary: 創建流程節點定義
 *     tags: [FlowNodeDefinitions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FlowNodeDefinition'
 *     responses:
 *       201:
 *         description: 流程節點定義創建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FlowNodeDefinition'
 *       400:
 *         description: 請求資料驗證失敗
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 */
router.post(
  '/',
  checkPermission(['MANAGE_FLOW_NODE_DEFINITIONS']),
  flowNodeDefinitionController.createNodeDefinition
);

/**
 * @swagger
 * /api/flow-node-definitions/{id}:
 *   put:
 *     summary: 更新流程節點定義
 *     tags: [FlowNodeDefinitions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 流程節點定義ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FlowNodeDefinition'
 *     responses:
 *       200:
 *         description: 流程節點定義更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FlowNodeDefinition'
 *       400:
 *         description: 請求資料驗證失敗
 *       404:
 *         description: 流程節點定義不存在
 */
router.put(
  '/:id',
  checkPermission(['MANAGE_FLOW_NODE_DEFINITIONS']),
  flowNodeDefinitionController.updateNodeDefinition
);

/**
 * @swagger
 * /api/flow-node-definitions/{id}:
 *   delete:
 *     summary: 刪除流程節點定義
 *     tags: [FlowNodeDefinitions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 流程節點定義ID
 *     responses:
 *       200:
 *         description: 流程節點定義刪除成功
 *       404:
 *         description: 流程節點定義不存在
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 */
router.delete(
  '/:id',
  checkPermission(['MANAGE_FLOW_NODE_DEFINITIONS']),
  flowNodeDefinitionController.deleteNodeDefinition
);

module.exports = router;    