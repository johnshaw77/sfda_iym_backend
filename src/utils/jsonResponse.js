/**
 * 成功響應
 * @param {Object} res - Express 響應對象
 * @param {number} statusCode - HTTP 狀態碼
 * @param {*} data - 響應數據
 * @param {string} message - 響應消息
 */
const successResponse = (
  res,
  statusCode = 200,
  data = null,
  message = "Success"
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * 錯誤響應
 * @param {Object} res - Express 響應對象
 * @param {number} statusCode - HTTP 狀態碼
 * @param {string} message - 錯誤消息
 * @param {*} error - 錯誤詳情
 */
const errorResponse = (
  res,
  statusCode = 400,
  message = "Error",
  error = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
