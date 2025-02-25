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
 *       properties:
 *         id:
 *           type: string
 *           description: 流程實例的唯一識別碼
 *           example: 1
 *         projectId:
 *           type: string
 *           description: 關聯的專案ID
 *         templateId:
 *           type: string
 *           description: 關聯的流程模板ID
 *         status:
 *           type: string
 *           description: 實例狀態
 *           enum: [draft, running, completed, failed]
 *           example: draft
 *         context:
 *           type: object
 *           description: 工作流上下文
 *         nodes:
 *           type: array
 *           description: 節點實例狀態
 *         edges:
 *           type: array
 *           description: 實際執行的邊緣狀態
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
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
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
 *       404:
 *         description: 流程實例不存在
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
 *             $ref: '#/components/schemas/FlowInstance'
 *     responses:
 *       201:
 *         description: 流程實例創建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FlowInstance'
 *       400:
 *         description: 請求資料驗證失敗
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
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
 *         description: 流程實例ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FlowInstance'
 *     responses:
 *       200:
 *         description: 流程實例更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FlowInstance'
 *       400:
 *         description: 請求資料驗證失敗
 *       404:
 *         description: 流程實例不存在
 */
router.put(
  "/:id",
  checkPermission(["MANAGE_FLOW_INSTANCES"]),
  flowInstanceController.updateInstance
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
 *     responses:
 *       200:
 *         description: 流程實例刪除成功
 *       404:
 *         description: 流程實例不存在
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 */
router.delete(
  "/:id",
  checkPermission(["MANAGE_FLOW_INSTANCES"]),
  flowInstanceController.deleteInstance
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
 *         description: 流程實例ID
 *     responses:
 *       200:
 *         description: 流程實例啟動成功
 *       404:
 *         description: 流程實例不存在
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 */
router.put(
  "/:id/start",
  checkPermission(["MANAGE_FLOW_INSTANCES"]),
  flowInstanceController.startInstance
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
 *         description: 流程實例ID
 *     responses:
 *       200:
 *         description: 流程實例停止成功
 *       404:
 *         description: 流程實例不存在
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 */
router.put(
  "/:id/stop",
  checkPermission(["MANAGE_FLOW_INSTANCES"]),
  flowInstanceController.stopInstance
);

//#region 工作流實例-流轉處理
// 節點執行相關
router.post(
  "/:id/nodes/:nodeId/execute",
  checkPermission(["MANAGE_FLOW_INSTANCES"]),
  flowInstanceController.executeNode
);

// 節點狀態相關
router.get(
  "/:id/nodes/:nodeId/status",
  checkPermission(["VIEW_FLOW_INSTANCES"]),
  flowInstanceController.getNodeStatus
);

// 工作流程暫停/繼續
router.put(
  "/:id/pause",
  checkPermission(["MANAGE_FLOW_INSTANCES"]),
  flowInstanceController.pauseInstance
);

// 工作流程繼續
router.put(
  "/:id/resume",
  checkPermission(["MANAGE_FLOW_INSTANCES"]),
  flowInstanceController.resumeInstance
);

// 日誌相關
router.get(
  "/:id/logs",
  checkPermission(["VIEW_FLOW_INSTANCES"]),
  flowInstanceController.getInstanceLogs
);

// 節點日誌相關
router.get(
  "/:id/nodes/:nodeId/logs",
  checkPermission(["VIEW_FLOW_INSTANCES"]),
  flowInstanceController.getNodeLogs
);

// 版本控制
router.get(
  "/:id/versions",
  checkPermission(["VIEW_FLOW_INSTANCES"]),
  flowInstanceController.getVersions
);

// 回滾到指定版本 (!TODO:備著，應該用不上)
router.post(
  "/:id/versions/:versionId/rollback",
  checkPermission(["MANAGE_FLOW_INSTANCES"]),
  flowInstanceController.rollbackToVersion
);
//#endregion
module.exports = router;
