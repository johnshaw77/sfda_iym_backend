const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { AppError } = require("./errorHandler");

const prisma = new PrismaClient();

/**
 * JWT Token 驗證中間件
 */
exports.authenticateToken = async (req, res, next) => {
  try {
    // 從 header 獲取 token
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      throw new AppError("未提供認證令牌", 401);
    }

    // 驗證 token
    console.log("token", token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded", decoded);
    // 檢查用戶是否存在且啟用
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        userRoles: {
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
        },
      },
    });

    if (!user) {
      throw new AppError("用戶不存在", 401);
    }

    if (!user.isActive) {
      throw new AppError("用戶帳號已停用", 401);
    }

    // 將用戶資訊和權限添加到請求對象
    req.user = user;
    req.userPermissions = user.userRoles.flatMap((ur) =>
      ur.role.rolePermissions.map((rp) => rp.permission.name)
    );

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      next(new AppError("無效的認證令牌", 401));
    } else if (error.name === "TokenExpiredError") {
      next(new AppError("認證令牌已過期", 401));
    } else {
      next(error);
    }
  }
};

/**
 * 管理員權限驗證中間件
 */
exports.authorizeAdmin = async (req, res, next) => {
  try {
    const user = req.user;

    // 檢查是否為管理員
    const isAdmin = user.userRoles.some((ur) => ur.role.name === "ADMIN");

    if (!isAdmin) {
      throw new AppError("需要管理員權限", 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * 權限驗證中間件生成器
 * @param {string|string[]} requiredPermissions - 需要的權限
 */
exports.authorize = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const userPermissions = req.userPermissions;

      // 轉換為陣列
      const required = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

      // 檢查是否具有所有需要的權限
      const hasAllPermissions = required.every((permission) =>
        userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        throw new AppError("權限不足", 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * 資源所有者驗證中間件
 * @param {string} paramName - URL 參數名稱，用於獲取資源 ID
 * @param {string} model - Prisma 模型名稱
 */
exports.authorizeOwner = (paramName, model) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramName];
      const userId = req.user.id;

      // 檢查資源是否存在且屬於當前用戶
      const resource = await prisma[model].findUnique({
        where: { id: resourceId },
      });

      if (!resource) {
        throw new AppError("資源不存在", 404);
      }

      if (resource.createdBy !== userId) {
        throw new AppError("無權訪問此資源", 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * 生成 JWT Token
 * @param {Object} payload - Token 載荷
 * @returns {string} JWT Token
 */
exports.generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * 驗證 JWT Token
 * @param {string} token - JWT Token
 * @returns {Object} 解碼後的載荷
 */
exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
