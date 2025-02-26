const { Prisma } = require("@prisma/client");
const { logger } = require("./logger");

/**
 * 處理 Prisma 錯誤
 * @param {Error} error - Prisma 錯誤對象
 * @param {Object} res - Express 響應對象
 */
const handlePrismaError = (error, res) => {
  console.error("Prisma 錯誤:", error);

  // 根據錯誤類型返回不同的響應
  if (error.code === "P2002") {
    // 唯一約束錯誤
    return res.status(409).json({
      success: false,
      message: "資源已存在",
      error: `${error.meta?.target?.join(", ")} 已存在`,
    });
  } else if (error.code === "P2025") {
    // 記錄不存在錯誤
    return res.status(404).json({
      success: false,
      message: "資源不存在",
      error: error.meta?.cause || "請求的資源不存在",
    });
  } else if (error.code === "P2003") {
    // 外鍵約束錯誤
    return res.status(400).json({
      success: false,
      message: "外鍵約束錯誤",
      error: `${error.meta?.field_name} 引用的資源不存在`,
    });
  } else if (error.name === "PrismaClientValidationError") {
    // 驗證錯誤
    return res.status(400).json({
      success: false,
      message: "請求數據無效",
      error: error.message,
    });
  } else {
    // 其他錯誤
    return res.status(500).json({
      success: false,
      message: "伺服器錯誤",
      error:
        process.env.NODE_ENV === "development" ? error.message : "發生內部錯誤",
    });
  }
};

module.exports = { handlePrismaError };
