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
  message = "操作成功"
) => {
  return res.status(statusCode).json({
    status: "success",
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
  message = "操作失敗",
  error = null
) => {
  const response = {
    status: "error",
    message,
  };

  // 只在開發環境或明確提供錯誤詳情時添加錯誤詳情
  if (
    error &&
    (process.env.NODE_ENV === "development" ||
      process.env.SHOW_ERROR_DETAILS === "true")
  ) {
    // 如果錯誤是對象且有 message 屬性，提取主要錯誤信息
    if (typeof error === "object" && error.message) {
      // 提取第一行錯誤訊息
      let errorMessage = error.message;
      if (errorMessage.includes("\n")) {
        errorMessage = errorMessage
          .split("\n")
          .filter((line) => line.trim())[0];
      }

      // 如果錯誤訊息太長，截斷它
      if (errorMessage.length > 200) {
        errorMessage = errorMessage.substring(0, 200) + "...";
      }

      response.error = {
        message: errorMessage,
        name: error.name || "Error",
      };
    } else {
      response.error = error;
    }
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse,
};
