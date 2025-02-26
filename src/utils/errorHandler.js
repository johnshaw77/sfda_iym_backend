const { Prisma } = require("@prisma/client");
const { logger } = require("./logger");

/**
 * 處理 Prisma 錯誤
 * @param {Error} error - 錯誤對象
 * @param {Object} res - Express 響應對象
 */
const handlePrismaError = (error, res) => {
  console.error("Prisma 錯誤:", error);

  // 格式化錯誤訊息，使其更易讀
  let errorMessage = error.message;

  // 如果是 Prisma 錯誤，提取更有用的信息
  if (error.name && error.name.includes("Prisma")) {
    // 提取第一行錯誤訊息
    if (error.message.includes("\n")) {
      errorMessage = error.message
        .split("\n")
        .filter((line) => line.trim())
        .slice(0, 2)
        .join(" - ");
    }

    // 如果錯誤訊息太長，截斷它
    if (errorMessage.length > 200) {
      errorMessage = errorMessage.substring(0, 200) + "...";
    }
  }

  // 根據錯誤類型返回不同的狀態碼和訊息
  if (error.code === "P2002") {
    // 唯一約束錯誤
    return res.status(409).json({
      status: "error",
      message: `資料已存在: ${error.meta?.target?.join(", ") || "未知欄位"}`,
    });
  } else if (error.code === "P2025") {
    // 記錄不存在
    return res.status(404).json({
      status: "error",
      message: "找不到請求的資源",
    });
  } else if (error.code === "P2003") {
    // 外鍵約束錯誤
    return res.status(400).json({
      status: "error",
      message: `外鍵約束錯誤: ${error.meta?.field_name || "未知欄位"}`,
    });
  } else if (error.name === "PrismaClientValidationError") {
    // 驗證錯誤
    return res.status(400).json({
      status: "error",
      message: `資料驗證錯誤: ${errorMessage}`,
    });
  } else {
    // 其他錯誤
    return res.status(500).json({
      status: "error",
      message: `資料庫操作錯誤: ${errorMessage}`,
    });
  }
};

module.exports = { handlePrismaError };
