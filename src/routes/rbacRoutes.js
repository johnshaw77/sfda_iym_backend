const express = require("express");
const router = express.Router();
const rbacController = require("../controllers/rbacController");
const { authenticateToken } = require("../middlewares/auth");
const checkPermission = require("../middlewares/checkPermission");

// 定義權限常量
const PERMISSIONS = {
  MANAGE_ROLES: "MANAGE_ROLES",
  MANAGE_PERMISSIONS: "MANAGE_PERMISSIONS",
  ASSIGN_ROLES: "ASSIGN_ROLES",
  VIEW_ROLES: "VIEW_ROLES",
  VIEW_PERMISSIONS: "VIEW_PERMISSIONS",
};

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
  checkPermission(PERMISSIONS.MANAGE_ROLES),
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
router.get(
  "/roles",
  authenticateToken,
  checkPermission(PERMISSIONS.VIEW_ROLES),
  rbacController.getAllRoles
);

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
  checkPermission(PERMISSIONS.MANAGE_ROLES),
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
  checkPermission(PERMISSIONS.MANAGE_ROLES),
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
  checkPermission(PERMISSIONS.MANAGE_PERMISSIONS),
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
router.get(
  "/permissions",
  authenticateToken,
  checkPermission(PERMISSIONS.VIEW_PERMISSIONS),
  rbacController.getAllPermissions
);

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
  checkPermission(
    [PERMISSIONS.MANAGE_ROLES, PERMISSIONS.MANAGE_PERMISSIONS],
    true
  ),
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
  checkPermission(
    [PERMISSIONS.MANAGE_ROLES, PERMISSIONS.MANAGE_PERMISSIONS],
    true
  ),
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
  checkPermission(PERMISSIONS.ASSIGN_ROLES),
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
  checkPermission(PERMISSIONS.ASSIGN_ROLES),
  rbacController.removeRoleFromUser
);

module.exports = router;
