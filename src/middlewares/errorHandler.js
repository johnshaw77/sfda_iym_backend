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
  }
}

/**
 * 處理 JWT 相關錯誤
 */
const handleJWTError = () => {
  return new AppError("無效的身份驗證令牌", 401);
};

/**
 * 處理 JWT 過期錯誤
 */
const handleJWTExpiredError = () => {
  return new AppError("身份驗證令牌已過期，請重新登入", 401);
};

/**
 * 處理 Prisma 相關錯誤
 */
const handlePrismaError = (err) => {
  if (err.code === "P2002") {
    return new AppError("資料已存在，請使用其他值", 400);
  }
  if (err.code === "P2025") {
    return new AppError("找不到請求的資源", 404);
  }
  return new AppError("資料庫操作錯誤", 500);
};

/**
 * 處理驗證錯誤
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `無效的輸入資料：${errors.join(". ")}`;
  return new AppError(message, 400);
};

/**
 * 開發環境錯誤處理
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

/**
 * 生產環境錯誤處理
 */
const sendErrorProd = (err, res) => {
  // 可信的操作錯誤：發送給客戶端
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // 程式錯誤：不洩露錯誤細節
  else {
    console.error("錯誤 🔥", err);
    res.status(500).json({
      status: "error",
      message: "系統發生錯誤",
    });
  }
};

/**
 * 全域錯誤處理中間件
 */
exports.errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
    if (error.name === "ValidationError") error = handleValidationError(error);
    if (error.code && error.code.startsWith("P"))
      error = handlePrismaError(error);

    sendErrorProd(error, res);
  }
};

/**
 * 404 錯誤處理中間件
 */
exports.notFound = (req, res, next) => {
  const err = new AppError(`找不到路徑：${req.originalUrl}`, 404);
  next(err);
};

/**
 * 自定義錯誤類別導出
 */
exports.AppError = AppError;

/**
 * 非同步錯誤處理包裝函數
 */
exports.catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * 驗證請求資料中間件
 */
exports.validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      return next(new AppError(message, 400));
    }
    next();
  };
};
