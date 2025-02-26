/**
 * 異步處理器包裝函數
 * 用於處理 Express 異步路由處理器的錯誤
 * 避免在每個異步路由處理器中都需要 try/catch
 *
 * @param {Function} fn - 異步路由處理器函數
 * @returns {Function} - 包裝後的路由處理器函數
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { asyncHandler };
