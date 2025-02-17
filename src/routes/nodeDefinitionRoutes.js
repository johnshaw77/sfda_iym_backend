const express = require("express");
const router = express.Router();
const nodeDefinitionController = require("../controllers/nodeDefinitionController");
const { authenticateToken } = require("../middlewares/auth");
const checkPermission = require("../middlewares/checkPermission");

/**
 * @swagger
 * components:
 *   schemas:
 *     NodeDefinition:
 *       type: object
 *       required:
 *         - typeKey
 *         - name
 *         - category
 *       properties:
 *         typeKey:
 *           type: string
 *           description: 節點定義的唯一識別鍵值
 *           example: data-input
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
 *           description: Vue 組件名稱
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
 *           type: object
 *           description: UI 配置
 *         validationRules:
 *           type: object
 *           description: 驗證規則
 *         handles:
 *           type: object
 *           description: 節點連接點配置
 */

// 將 authenticateToken 中間件應用到所有路由
//router.use(authenticateToken);

/**
 * @swagger
 * /api/node-definitions:
 *   get:
 *     summary: 獲取所有節點定義
 *     tags: [NodeDefinitions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功獲取節點定義列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/NodeDefinition'
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 */
router.get(
  "/",
  authenticateToken,
  //checkPermission(["VIEW_NODE_DEFINITIONS"]),
  nodeDefinitionController.getNodeDefinitions
);

/**
 * @swagger
 * /api/node-definitions/{typeKey}:
 *   get:
 *     summary: 獲取單個節點定義
 *     tags: [NodeDefinitions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: typeKey
 *         required: true
 *         schema:
 *           type: string
 *         description: 節點定義的唯一識別鍵值
 *     responses:
 *       200:
 *         description: 成功獲取節點定義
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NodeDefinition'
 *       404:
 *         description: 節點定義不存在
 */
router.get(
  "/:typeKey",
  checkPermission(["VIEW_NODE_DEFINITIONS"]),
  nodeDefinitionController.getNodeDefinition
);

/**
 * @swagger
 * /api/node-definitions:
 *   post:
 *     summary: 創建節點定義
 *     tags: [NodeDefinitions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NodeDefinition'
 *     responses:
 *       201:
 *         description: 節點定義創建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NodeDefinition'
 *       400:
 *         description: 請求資料驗證失敗
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 */
router.post(
  "/",
  checkPermission(["MANAGE_NODE_DEFINITIONS"]),
  nodeDefinitionController.createNodeDefinition
);

/**
 * @swagger
 * /api/node-definitions/{typeKey}:
 *   put:
 *     summary: 更新節點定義
 *     tags: [NodeDefinitions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: typeKey
 *         required: true
 *         schema:
 *           type: string
 *         description: 節點定義的唯一識別鍵值
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NodeDefinition'
 *     responses:
 *       200:
 *         description: 節點定義更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NodeDefinition'
 *       400:
 *         description: 請求資料驗證失敗
 *       404:
 *         description: 節點定義不存在
 */
router.put(
  "/:typeKey",
  checkPermission(["MANAGE_NODE_DEFINITIONS"]),
  nodeDefinitionController.updateNodeDefinition
);

/**
 * @swagger
 * /api/node-definitions/{typeKey}:
 *   delete:
 *     summary: 刪除節點定義
 *     tags: [NodeDefinitions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: typeKey
 *         required: true
 *         schema:
 *           type: string
 *         description: 節點定義的唯一識別鍵值
 *     responses:
 *       200:
 *         description: 節點定義刪除成功
 *       404:
 *         description: 節點定義不存在
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 */
router.delete(
  "/:typeKey",
  checkPermission(["MANAGE_NODE_DEFINITIONS"]),
  nodeDefinitionController.deleteNodeDefinition
);

module.exports = router;
