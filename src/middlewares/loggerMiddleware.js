const { logger, formatApiLog } = require("../utils/logger");

const loggerMiddleware = (req, res, next) => {
  // 記錄請求開始時間
  const start = Date.now();

  // 在響應結束時記錄日誌
  res.on("finish", () => {
    const responseTime = Date.now() - start;
    const logData = formatApiLog(req, res, responseTime);

    // 根據狀態碼選擇日誌級別
    if (res.statusCode >= 500) {
      logger.error("API 錯誤", logData);
    } else if (res.statusCode >= 400) {
      logger.warn("API 警告", logData);
    } else {
      logger.info("API 請求", logData);
    }
  });

  next();
};

module.exports = loggerMiddleware;
