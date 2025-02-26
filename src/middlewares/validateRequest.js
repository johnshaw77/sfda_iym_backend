/**
 * 請求驗證中間件
 * 用於驗證請求參數、查詢參數和請求體
 *
 * @param {Object} schema - Joi 驗證模式
 * @param {Object} schema.params - 路徑參數驗證模式
 * @param {Object} schema.query - 查詢參數驗證模式
 * @param {Object} schema.body - 請求體驗證模式
 * @returns {Function} - Express 中間件函數
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    const validationErrors = [];

    // 驗證路徑參數
    if (schema.params) {
      const { error } = schema.params.validate(req.params);
      if (error) {
        validationErrors.push(
          ...error.details.map((detail) => ({
            type: "params",
            message: detail.message,
          }))
        );
      }
    }

    // 驗證查詢參數
    if (schema.query) {
      const { error } = schema.query.validate(req.query);
      if (error) {
        validationErrors.push(
          ...error.details.map((detail) => ({
            type: "query",
            message: detail.message,
          }))
        );
      }
    }

    // 驗證請求體
    if (schema.body) {
      const { error } = schema.body.validate(req.body);
      if (error) {
        validationErrors.push(
          ...error.details.map((detail) => ({
            type: "body",
            message: detail.message,
          }))
        );
      }
    }

    // 如果有驗證錯誤，返回 400 錯誤
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "請求驗證失敗",
        errors: validationErrors,
      });
    }

    // 驗證通過，繼續處理請求
    next();
  };
};

module.exports = { validateRequest };
