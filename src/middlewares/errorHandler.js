const { logger } = require("../utils/logger");

/**
 * 自定義錯誤類別
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);

    // 記錄錯誤日誌
    const logLevel = this.status === "fail" ? "warn" : "error";
    logger[logLevel]({
      message: this.message,
      statusCode: this.statusCode,
      stack: this.stack,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * 錯誤處理工具函數
 */
const errorUtils = {
  handleJWTError: () => {
    return new AppError("無效的身份驗證令牌", 401);
  },

  handleJWTExpiredError: () => {
    return new AppError("身份驗證令牌已過期，請重新登入", 401);
  },

  handlePrismaError: (err) => {
    if (err.code === "P2002") {
      return new AppError("資料已存在，請使用其他值", 400);
    }
    if (err.code === "P2025") {
      return new AppError("找不到請求的資源", 404);
    }
    return new AppError("資料庫操作錯誤", 500);
  },

  handleValidationError: (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `無效的輸入資料：${errors.join(". ")}`;
    return new AppError(message, 400);
  },

  sendErrorDev: (err, res) => {
    logger.debug({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });

    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  },

  sendErrorProd: (err, res) => {
    if (err.isOperational) {
      logger.warn({
        status: err.status,
        message: err.message,
        statusCode: err.statusCode,
      });

      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      logger.error({
        status: "error",
        message: err.message,
        error: err,
        stack: err.stack,
      });

      res.status(500).json({
        status: "error",
        message: "系統發生錯誤",
      });
    }
  },
};

/**
 * 全域錯誤處理中間件
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // 記錄錯誤
  logger.error("未處理的錯誤", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    user: req.user,
  });

  if (process.env.NODE_ENV === "development") {
    errorUtils.sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (error.name === "JsonWebTokenError") error = errorUtils.handleJWTError();
    if (error.name === "TokenExpiredError")
      error = errorUtils.handleJWTExpiredError();
    if (error.name === "ValidationError")
      error = errorUtils.handleValidationError(error);
    if (error.code && error.code.startsWith("P"))
      error = errorUtils.handlePrismaError(error);

    errorUtils.sendErrorProd(error, res);
  }
};

/**
 * 404 錯誤處理中間件
 */
const notFound = (req, res, next) => {
  next(new AppError(`找不到路徑：${req.originalUrl}`, 404));
};

/**
 * 非同步錯誤處理包裝函數
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * 驗證請求資料中間件
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      return next(new AppError(message, 400));
    }
    next();
  };
};

module.exports = {
  errorHandler,
  notFound,
  AppError,
  catchAsync,
  validateRequest,
};
