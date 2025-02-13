const winston = require("winston");
const path = require("path");

// 定義日誌格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 創建 Winston logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  format: logFormat,
  transports: [
    // 寫入所有日誌到 combined.log
    new winston.transports.File({
      filename: path.join(__dirname, "../../logs/combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // 寫入所有錯誤到 error.log
    new winston.transports.File({
      filename: path.join(__dirname, "../../logs/error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// 在開發環境下也輸出到控制台
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// 創建日誌目錄
const fs = require("fs");
const logDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

module.exports = logger;
