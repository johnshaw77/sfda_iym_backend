const express = require("express");
const router = express.Router();
const rbacController = require("../controllers/rbacController");
const { authenticateToken, authorizeAdmin } = require("../middlewares/auth");

/**
 * @swagger
 * tags:
 *   name: RBAC
 *   description: 角色權限管理相關 API
 */

/**
 * @swagger
 * /api/rbac/roles:
 *   post:
 *     tags: [RBAC]
 *     summary: 創建新角色
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
 *               description:
 *                 type: string
 */
router.post(
  "/roles",
  authenticateToken,
  authorizeAdmin,
  rbacController.createRole
);

/**
 * @swagger
 * /api/rbac/roles:
 *   get:
 *     tags: [RBAC]
 *     summary: 獲取所有角色
 *     security:
 *       - bearerAuth: []
 */
router.get("/roles", authenticateToken, rbacController.getAllRoles);

/**
 * @swagger
 * /api/rbac/roles/{id}:
 *   put:
 *     tags: [RBAC]
 *     summary: 更新角色
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.put(
  "/roles/:id",
  authenticateToken,
  authorizeAdmin,
  rbacController.updateRole
);

/**
 * @swagger
 * /api/rbac/roles/{id}:
 *   delete:
 *     tags: [RBAC]
 *     summary: 刪除角色
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete(
  "/roles/:id",
  authenticateToken,
  authorizeAdmin,
  rbacController.deleteRole
);

/**
 * @swagger
 * /api/rbac/permissions:
 *   post:
 *     tags: [RBAC]
 *     summary: 創建新權限
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/permissions",
  authenticateToken,
  authorizeAdmin,
  rbacController.createPermission
);

/**
 * @swagger
 * /api/rbac/permissions:
 *   get:
 *     tags: [RBAC]
 *     summary: 獲取所有權限
 *     security:
 *       - bearerAuth: []
 */
router.get("/permissions", authenticateToken, rbacController.getAllPermissions);

/**
 * @swagger
 * /api/rbac/role-permissions:
 *   post:
 *     tags: [RBAC]
 *     summary: 為角色分配權限
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/role-permissions",
  authenticateToken,
  authorizeAdmin,
  rbacController.assignPermissionToRole
);

/**
 * @swagger
 * /api/rbac/role-permissions/{roleId}/{permissionId}:
 *   delete:
 *     tags: [RBAC]
 *     summary: 移除角色的權限
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  "/role-permissions/:roleId/:permissionId",
  authenticateToken,
  authorizeAdmin,
  rbacController.removePermissionFromRole
);

/**
 * @swagger
 * /api/rbac/user-roles:
 *   post:
 *     tags: [RBAC]
 *     summary: 為用戶分配角色
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/user-roles",
  authenticateToken,
  authorizeAdmin,
  rbacController.assignRoleToUser
);

/**
 * @swagger
 * /api/rbac/user-roles/{userId}/{roleId}:
 *   delete:
 *     tags: [RBAC]
 *     summary: 移除用戶的角色
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  "/user-roles/:userId/:roleId",
  authenticateToken,
  authorizeAdmin,
  rbacController.removeRoleFromUser
);

module.exports = router;
