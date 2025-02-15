const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middlewares/auth");
const {
  registerValidation,
  loginSchema,
  updateUserValidation,
  validate,
} = require("../middlewares/validator");
const { uploadAvatar, handleUploadError } = require("../middlewares/upload");

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: 用戶ID
 *         username:
 *           type: string
 *           description: 用戶名
 *         email:
 *           type: string
 *           format: email
 *           description: 電子郵件
 *         role:
 *           type: string
 *           enum: [USER, ADMIN]
 *           description: 用戶角色
 *         isActive:
 *           type: boolean
 *           description: 帳號狀態
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 創建時間
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新時間
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [認證]
 *     summary: 用戶註冊
 *     description: 創建新用戶帳號
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
 *               - confirmPassword
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 description: 用戶名
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 電子郵件
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: 密碼
 *               confirmPassword:
 *                 type: string
 *                 description: 確認密碼
 *     responses:
 *       201:
 *         description: 註冊成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: 輸入驗證失敗
 *       409:
 *         description: 用戶名或電子郵件已存在
 */
router.post("/register", registerValidation, authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [認證]
 *     summary: 用戶登入
 *     description: 使用電子郵件和密碼登入
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 電子郵件
 *               password:
 *                 type: string
 *                 description: 密碼
 *     responses:
 *       200:
 *         description: 登入成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: 電子郵件或密碼錯誤
 *       403:
 *         description: 帳號已被停用
 */
router.post("/login", validate(loginSchema), authController.login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [認證]
 *     summary: 獲取當前用戶信息
 *     description: 獲取已登入用戶的詳細信息
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功獲取用戶信息
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: 未提供認證令牌或令牌無效
 */
router.get("/me", authenticateToken, authController.getCurrentUser);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     tags: [認證]
 *     summary: 更新用戶資料
 *     description: 更新當前用戶的個人資料
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 description: 新用戶名
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 新電子郵件
 *               currentPassword:
 *                 type: string
 *                 description: 當前密碼（更改密碼時需要）
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: 新密碼
 *               confirmNewPassword:
 *                 type: string
 *                 description: 確認新密碼
 *     responses:
 *       200:
 *         description: 資料更新成功
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
 *         description: 輸入驗證失敗
 *       401:
 *         description: 當前密碼錯誤
 *       409:
 *         description: 用戶名或電子郵件已被使用
 */
router.put(
  "/profile",
  authenticateToken,
  updateUserValidation,
  authController.updateProfile
);

/**
 * @swagger
 * /api/auth/avatar:
 *   put:
 *     tags: [認證]
 *     summary: 更新用戶頭像
 *     description: 上傳並更新當前用戶的頭像
 *     security:
 *       - bearerAuth: []
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
 *                 description: 頭像圖片檔案
 *     responses:
 *       200:
 *         description: 頭像更新成功
 *       400:
 *         description: 檔案格式或大小不符合要求
 *       401:
 *         description: 未提供認證令牌或令牌無效
 */
router.put(
  "/avatar",
  authenticateToken,
  uploadAvatar,
  handleUploadError,
  authController.updateAvatar
);

module.exports = router;
