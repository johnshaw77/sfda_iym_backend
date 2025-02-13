const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticateToken, authorizeAdmin } = require("../middlewares/auth");

/**
 * @swagger
 * tags:
 *   name: 用戶管理
 *   description: 用戶管理相關接口（需要管理員權限）
 */

// 所有路由都需要認證和管理員權限
router.use(authenticateToken, authorizeAdmin);

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [用戶管理]
 *     summary: 獲取所有用戶列表
 *     description: 獲取系統中所有用戶的列表（需要管理員權限）
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功獲取用戶列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: 未提供認證令牌或令牌無效
 *       403:
 *         description: 沒有管理員權限
 */
router.get("/", userController.getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [用戶管理]
 *     summary: 獲取特定用戶信息
 *     description: 通過用戶ID獲取特定用戶的詳細信息（需要管理員權限）
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 用戶ID
 *     responses:
 *       200:
 *         description: 成功獲取用戶信息
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: 未提供認證令牌或令牌無效
 *       403:
 *         description: 沒有管理員權限
 *       404:
 *         description: 用戶不存在
 */
router.get("/:id", userController.getUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags: [用戶管理]
 *     summary: 更新用戶資料
 *     description: 更新特定用戶的資料（需要管理員權限）
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 用戶ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: 用戶名
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 電子郵件
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *                 description: 用戶角色
 *               isActive:
 *                 type: boolean
 *                 description: 帳號狀態
 *               password:
 *                 type: string
 *                 description: 新密碼
 *     responses:
 *       200:
 *         description: 用戶資料更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: 輸入驗證失敗或角色值無效
 *       401:
 *         description: 未提供認證令牌或令牌無效
 *       403:
 *         description: 沒有管理員權限
 *       404:
 *         description: 用戶不存在
 *       409:
 *         description: 用戶名或電子郵件已被使用
 */
router.put("/:id", userController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [用戶管理]
 *     summary: 刪除用戶
 *     description: 刪除特定用戶（需要管理員權限）
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 用戶ID
 *     responses:
 *       200:
 *         description: 用戶刪除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: 無法刪除最後一個管理員帳號
 *       401:
 *         description: 未提供認證令牌或令牌無效
 *       403:
 *         description: 沒有管理員權限
 *       404:
 *         description: 用戶不存在
 */
router.delete("/:id", userController.deleteUser);

module.exports = router;
