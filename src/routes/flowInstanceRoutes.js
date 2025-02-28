const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/auth");
const checkPermission = require("../middlewares/checkPermission");
const flowInstanceController = require("../controllers/flowInstanceController");

/**
 * @swagger
 * components:
 *   schemas:
 *     FlowInstance:
 *       type: object
 *       required:
 *         - projectId
 *         - templateId
 *         - nodes
 *         - edges
 *       properties:
 *         id:
 *           type: string
 *           description: 流程實例的唯一識別碼
 *         projectId:
 *           type: string
 *           description: 關聯的專案ID
 *         templateId:
 *           type: string
 *           description: 關聯的流程模板ID
 *         status:
 *           type: string
 *           enum: [draft, running, paused, completed, failed, stopped]
 *           default: draft
 *           description: 實例狀態
 *         nodes:
 *           type: array
 *           description: 節點定義（包含位置、配置等）
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: 節點唯一識別碼
 *               type:
 *                 type: string
 *                 description: 節點類型
 *               position:
 *                 type: object
 *                 description: 節點位置
 *               data:
 *                 type: object
 *                 description: 節點數據
 *         edges:
 *           type: array
 *           description: 連線定義
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: 連線唯一識別碼
 *               source:
 *                 type: string
 *                 description: 來源節點ID
 *               target:
 *                 type: string
 *                 description: 目標節點ID
 *         context:
 *           type: object
 *           description: 執行上下文（存儲節點間的數據傳遞）
 *         nodeStates:
 *           type: object
 *           description: 節點狀態（記錄每個節點的執行狀態）
 *         logs:
 *           type: array
 *           description: 執行日誌
 *         lastNodeId:
 *           type: string
 *           description: 最後執行的節點ID
 *         error:
 *           type: string
 *           description: 錯誤信息
 *         startedAt:
 *           type: string
 *           format: date-time
 *           description: 開始執行時間
 *         endedAt:
 *           type: string
 *           format: date-time
 *           description: 完成時間
 *         pausedAt:
 *           type: string
 *           format: date-time
 *           description: 暫停時間
 *         createdBy:
 *           type: string
 *           description: 創建者ID
 *         updatedBy:
 *           type: string
 *           description: 更新者ID
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
 * /api/flow-instances:
 *   get:
 *     summary: 獲取所有流程實例
 *     tags: [FlowInstances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: 按專案ID過濾
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, running, paused, completed, failed, stopped]
 *         description: 按狀態過濾
 *     responses:
 *       200:
 *         description: 成功獲取流程實例列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FlowInstance'
 */
router.get(
  "/",
  checkPermission(["VIEW_FLOW_INSTANCES"]),
  flowInstanceController.getAllInstances
);

/**
 * @swagger
 * /api/flow-instances/{id}:
 *   get:
 *     summary: 獲取單個流程實例
 *     tags: [FlowInstances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 流程實例ID
 *     responses:
 *       200:
 *         description: 成功獲取流程實例
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FlowInstance'
 */
router.get(
  "/:id",
  checkPermission(["VIEW_FLOW_INSTANCES"]),
  flowInstanceController.getInstanceById
);

/**
 * @swagger
 * /api/flow-instances:
 *   post:
 *     summary: 創建流程實例
 *     tags: [FlowInstances]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *               - templateId
 *               - nodes
 *               - edges
 *             properties:
 *               projectId:
 *                 type: string
 *               templateId:
 *                 type: string
 *               nodes:
 *                 type: array
 *               edges:
 *                 type: array
 *     responses:
 *       201:
 *         description: 流程實例創建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FlowInstance'
 */
router.post(
  "/",
  checkPermission(["MANAGE_FLOW_INSTANCES"]),
  flowInstanceController.createInstance
);

/**
 * @swagger
 * /api/flow-instances/{id}:
 *   put:
 *     summary: 更新流程實例
 *     tags: [FlowInstances]
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
 *               nodes:
 *                 type: array
 *               edges:
 *                 type: array
 *     responses:
 *       200:
 *         description: 流程實例更新成功
 */
router.put(
  "/:id",
  checkPermission(["MANAGE_FLOW_INSTANCES"]),
  flowInstanceController.updateInstance
);

/**
 * @swagger
 * /api/flow-instances/{id}/start:
 *   put:
 *     summary: 啟動流程實例
 *     tags: [FlowInstances]
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
 *         description: 流程實例啟動成功
 */
router.put(
  "/:id/start",
  checkPermission(["MANAGE_FLOW_INSTANCES"]),
  flowInstanceController.startInstance
);

/**
 * @swagger
 * /api/flow-instances/{id}/pause:
 *   put:
 *     summary: 暫停流程實例
 *     tags: [FlowInstances]
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
 *         description: 流程實例暫停成功
 */
router.put(
  "/:id/pause",
  checkPermission(["MANAGE_FLOW_INSTANCES"]),
  flowInstanceController.pauseInstance
);

/**
 * @swagger
 * /api/flow-instances/{id}/resume:
 *   put:
 *     summary: 繼續執行流程實例
 *     tags: [FlowInstances]
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
 *         description: 流程實例繼續執行成功
 */
router.put(
  "/:id/resume",
  checkPermission(["MANAGE_FLOW_INSTANCES"]),
  flowInstanceController.resumeInstance
);

/**
 * @swagger
 * /api/flow-instances/{id}/stop:
 *   put:
 *     summary: 停止流程實例
 *     tags: [FlowInstances]
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
 *         description: 流程實例停止成功
 */
router.put(
  "/:id/stop",
  checkPermission(["MANAGE_FLOW_INSTANCES"]),
  flowInstanceController.stopInstance
);

/**
 * @swagger
 * /api/flow-instances/{id}/nodes/{nodeId}/execute:
 *   post:
 *     summary: 執行節點
 *     tags: [FlowInstances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 流程實例ID
 *       - in: path
 *         name: nodeId
 *         required: true
 *         schema:
 *           type: string
 *         description: 節點ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               input:
 *                 type: object
 *                 description: 節點輸入數據
 *     responses:
 *       200:
 *         description: 節點執行成功
 */
router.post(
  "/:id/nodes/:nodeId/execute",
  checkPermission(["MANAGE_FLOW_INSTANCES"]),
  flowInstanceController.executeNode
);

/**
 * @swagger
 * /api/flow-instances/{id}/logs:
 *   get:
 *     summary: 獲取實例日誌
 *     tags: [FlowInstances]
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
 *         description: 成功獲取日誌
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                   nodeId:
 *                     type: string
 *                   message:
 *                     type: string
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 */
router.get(
  "/:id/logs",
  checkPermission(["VIEW_FLOW_INSTANCES"]),
  flowInstanceController.getInstanceLogs
);

/**
 * @swagger
 * /api/flow-instances/{id}/nodes/{nodeId}/logs:
 *   get:
 *     summary: 獲取節點日誌
 *     tags: [FlowInstances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: nodeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功獲取節點日誌
 */
router.get(
  "/:id/nodes/:nodeId/logs",
  checkPermission(["VIEW_FLOW_INSTANCES"]),
  flowInstanceController.getNodeLogs
);

/**
 * @swagger
 * /api/flow-instances/{id}:
 *   delete:
 *     summary: 刪除流程實例
 *     tags: [FlowInstances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 流程實例ID
 *       - in: query
 *         name: force
 *         schema:
 *           type: boolean
 *         description: 管理員強制刪除標誌，設為true時允許管理員刪除任何狀態的流程實例
 *     responses:
 *       200:
 *         description: 流程實例刪除成功
 *       400:
 *         description: 只有草稿和失敗狀態的流程實例可以刪除，或者需要管理員權限進行強制刪除
 *       404:
 *         description: 流程實例不存在
 */
router.delete(
  "/:id",
  checkPermission(["MANAGE_FLOW_INSTANCES"]),
  flowInstanceController.deleteInstance
);

module.exports = router;
