const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const userController = require("../controllers/userController");
const {
  authenticateToken,
  authorize,
  authorizeAdmin,
} = require("../middlewares/auth");

/**
 * @swagger
 * tags:
 *   name: 用戶管理
 *   description: 用戶管理相關接口（需要管理員權限）
 */

// 所有路由都需要認證和權限
router.use(authenticateToken);
router.use(authorize("MANAGE_USERS"));

// 配置 multer 存儲
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads/avatars"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 限制 5MB
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("只允許上傳圖片文件"));
  },
});

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
 * /api/users:
 *   post:
 *     tags: [用戶管理]
 *     summary: 創建新用戶
 *     description: 創建一個新用戶（需要管理員權限）
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 default: active
 *     responses:
 *       201:
 *         description: 用戶創建成功
 *       400:
 *         description: 用戶名或郵箱已存在
 *       401:
 *         description: 未提供認證令牌或令牌無效
 *       403:
 *         description: 沒有管理員權限
 */
router.post("/", userController.createUser);

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
 *               email:
 *                 type: string
 *                 format: email
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: 用戶資料更新成功
 *       400:
 *         description: 用戶名或郵箱已被使用
 *       401:
 *         description: 未提供認證令牌或令牌無效
 *       403:
 *         description: 沒有管理員權限
 *       404:
 *         description: 用戶不存在
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
 *       401:
 *         description: 未提供認證令牌或令牌無效
 *       403:
 *         description: 沒有管理員權限
 *       404:
 *         description: 用戶不存在
 */
router.delete("/:id", userController.deleteUser);

/**
 * @swagger
 * /api/users/{userId}/roles:
 *   get:
 *     tags: [用戶管理]
 *     summary: 獲取用戶的角色
 *     description: 獲取特定用戶的所有角色（需要管理員權限）
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 用戶ID
 *     responses:
 *       200:
 *         description: 成功獲取用戶角色
 *       401:
 *         description: 未提供認證令牌或令牌無效
 *       403:
 *         description: 沒有管理員權限
 *       404:
 *         description: 用戶不存在
 */
router.get("/:userId/roles", userController.getUserRoles);

/**
 * @swagger
 * /api/users/user-roles:
 *   post:
 *     tags: [用戶管理]
 *     summary: 為用戶分配角色
 *     description: 為特定用戶分配一個角色（需要管理員權限）
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - roleId
 *             properties:
 *               userId:
 *                 type: string
 *               roleId:
 *                 type: string
 *     responses:
 *       201:
 *         description: 角色分配成功
 *       400:
 *         description: 該角色已分配給此用戶
 *       401:
 *         description: 未提供認證令牌或令牌無效
 *       403:
 *         description: 沒有管理員權限
 *       404:
 *         description: 用戶或角色不存在
 */
router.post("/user-roles", userController.assignRoleToUser);

/**
 * @swagger
 * /api/users/user-roles/{userId}/{roleId}:
 *   delete:
 *     tags: [用戶管理]
 *     summary: 移除用戶的角色
 *     description: 移除特定用戶的特定角色（需要管理員權限）
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 用戶ID
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: 角色ID
 *     responses:
 *       200:
 *         description: 角色移除成功
 *       401:
 *         description: 未提供認證令牌或令牌無效
 *       403:
 *         description: 沒有管理員權限
 *       404:
 *         description: 該用戶未分配此角色
 */
router.delete("/user-roles/:userId/:roleId", userController.removeRoleFromUser);

/**
 * @swagger
 * /api/users/{id}/avatar:
 *   post:
 *     tags: [用戶管理]
 *     summary: 上傳用戶頭像
 *     description: 上傳並更新用戶的頭像（需要管理員權限）
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: 頭像上傳成功
 *       400:
 *         description: 請求錯誤
 *       401:
 *         description: 未提供認證令牌或令牌無效
 *       403:
 *         description: 沒有管理員權限
 *       404:
 *         description: 用戶不存在
 */
router.post(
  "/:id/avatar",
  authenticateToken,
  authorizeAdmin,
  upload.single("avatar"),
  userController.uploadAvatar
);

module.exports = router;
