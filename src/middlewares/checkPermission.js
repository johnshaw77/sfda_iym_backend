const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { logger } = require("../utils/logger");
const { AppError } = require("./errorHandler");

/**
 * 檢查用戶是否具有指定權限
 * @param {string|string[]} requiredPermissions - 需要的權限（可以是單個權限或權限數組）
 * @param {boolean} requireAll - 是否需要滿足所有權限（默認為 false，即滿足任一權限即可）
 */
const checkPermission = (requiredPermissions, requireAll = false) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;

      // 檢查是否為超級管理員或管理員
      if (req.user.role === "SUPER_ADMIN" || req.user.role === "ADMIN") {
        logger.info("管理員權限檢查通過", {
          userId,
          role: req.user.role,
          requiredPermissions,
        });
        return next();
      }

      // 獲取用戶的所有角色和權限
      const userRoles = await prisma.userRole.findMany({
        where: { userId },
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      // 提取用戶的所有權限
      const userPermissions = new Set();
      userRoles.forEach((userRole) => {
        userRole.role.rolePermissions.forEach((rolePermission) => {
          userPermissions.add(rolePermission.permission.name);
        });
      });

      // 轉換 requiredPermissions 為數組
      const permissions = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

      // 檢查權限
      const hasPermission = requireAll
        ? permissions.every((permission) => userPermissions.has(permission))
        : permissions.some((permission) => userPermissions.has(permission));

      if (!hasPermission) {
        logger.warn("權限檢查失敗", {
          userId,
          requiredPermissions,
          userPermissions: Array.from(userPermissions),
          requireAll,
        });

        return next(new AppError("權限不足", 403));
      }

      logger.info("權限檢查通過", {
        userId,
        requiredPermissions,
        userPermissions: Array.from(userPermissions),
      });

      // 將用戶權限添加到請求對象中，方便後續使用
      req.userPermissions = Array.from(userPermissions);
      next();
    } catch (error) {
      logger.error("權限檢查錯誤", {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id,
      });
      next(new AppError("權限檢查過程中發生錯誤", 500));
    }
  };
};

module.exports = checkPermission;
