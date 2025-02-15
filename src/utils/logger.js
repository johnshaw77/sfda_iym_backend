const winston = require("winston");
const path = require("path");
const fs = require("fs");

// 創建日誌目錄
const logDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// 定義日誌格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 定義日誌級別
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// 創建 Winston logger 實例
const logger = winston.createLogger({
  levels,
  format: logFormat,
  transports: [
    // 錯誤日誌
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // 警告日誌
    new winston.transports.File({
      filename: path.join(logDir, "warn.log"),
      level: "warn",
      maxsize: 5242880,
      maxFiles: 5,
    }),
    // 所有日誌
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      maxsize: 5242880,
      maxFiles: 5,
    }),
    // API 請求日誌
    new winston.transports.File({
      filename: path.join(logDir, "api.log"),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// 在開發環境下同時輸出到控制台
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ level, message, timestamp, ...metadata }) => {
          let msg = `${timestamp} [${level}] : ${message} `;
          if (Object.keys(metadata).length > 0) {
            msg += JSON.stringify(metadata);
          }
          return msg;
        })
      ),
    })
  );
}

// 日誌級別
const LogLevel = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  DEBUG: "debug",
};

// API 請求日誌格式化
const formatApiLog = (req, res, responseTime) => ({
  timestamp: new Date().toISOString(),
  method: req.method,
  url: req.originalUrl,
  status: res.statusCode,
  responseTime: `${responseTime}ms`,
  userAgent: req.get("user-agent"),
  ip: req.ip,
  userId: req.user?.id || "anonymous",
});

// 創建一個包裝器，確保所有日誌方法都可用
const wrappedLogger = {
  error: (message, meta = {}) => logger.error(message, meta),
  warn: (message, meta = {}) => logger.warn(message, meta),
  info: (message, meta = {}) => logger.info(message, meta),
  debug: (message, meta = {}) => logger.debug(message, meta),
  log: (level, message, meta = {}) => logger.log(level, message, meta),
};

module.exports = {
  logger: wrappedLogger,
  LogLevel,
  formatApiLog,
};
