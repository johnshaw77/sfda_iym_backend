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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
 * @param {Object} options - 選項
 * @param {boolean} options.requireAll - 是否需要具備所有權限，預設為 true
 * @param {boolean} options.allowAdmin - 是否允許管理員繞過權限檢查，預設為 true
 */
exports.authorize = (requiredPermissions, options = {}) => {
  const { requireAll = true, allowAdmin = true } = options;

  return async (req, res, next) => {
    try {
      const userPermissions = req.userPermissions;
      const isAdmin = req.user.userRoles.some((ur) => ur.role.name === "ADMIN");

      // 如果是管理員且允許管理員繞過權限檢查
      if (allowAdmin && isAdmin) {
        return next();
      }

      // 轉換為陣列
      const required = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

      // 根據 requireAll 選項檢查權限
      const hasPermission = requireAll
        ? required.every((permission) => userPermissions.includes(permission))
        : required.some((permission) => userPermissions.includes(permission));

      if (!hasPermission) {
        throw new AppError(
          requireAll ? "需要具備所有指定權限" : "需要具備至少一個指定權限",
          403
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * 資源所有者或管理員驗證中間件
 * @param {string} paramName - URL 參數名稱，用於獲取資源 ID
 * @param {string} model - Prisma 模型名稱
 * @param {Object} options - 選項
 * @param {boolean} options.allowAdmin - 是否允許管理員訪問，預設為 true
 * @param {string} options.userField - 用戶 ID 欄位名稱，預設為 'createdBy'
 */
exports.authorizeOwnerOrAdmin = (paramName, model, options = {}) => {
  const { allowAdmin = true, userField = "createdBy" } = options;

  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramName];
      const userId = req.user.id;
      const isAdmin = req.user.userRoles.some((ur) => ur.role.name === "ADMIN");

      // 檢查資源是否存在
      const resource = await prisma[model].findUnique({
        where: { id: resourceId },
      });

      if (!resource) {
        throw new AppError("資源不存在", 404);
      }

      // 如果是管理員且允許管理員訪問
      if (allowAdmin && isAdmin) {
        return next();
      }

      // 檢查資源是否屬於當前用戶
      if (resource[userField] !== userId) {
        throw new AppError("無權訪問此資源", 403);
      }

      // 將資源添加到請求對象中
      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * 角色驗證中間件生成器
 * @param {string|string[]} requiredRoles - 需要的角色
 * @param {Object} options - 選項
 * @param {boolean} options.requireAll - 是否需要具備所有角色，預設為 false
 */
exports.authorizeRoles = (requiredRoles, options = {}) => {
  const { requireAll = false } = options;

  return async (req, res, next) => {
    try {
      const userRoles = req.user.userRoles.map((ur) => ur.role.name);

      // 轉換為陣列
      const required = Array.isArray(requiredRoles)
        ? requiredRoles
        : [requiredRoles];

      // 根據 requireAll 選項檢查角色
      const hasRole = requireAll
        ? required.every((role) => userRoles.includes(role))
        : required.some((role) => userRoles.includes(role));

      if (!hasRole) {
        throw new AppError(
          requireAll ? "需要具備所有指定角色" : "需要具備至少一個指定角色",
          403
        );
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
