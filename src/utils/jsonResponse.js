// 統一的錯誤回應格式
const errorResponse = (res, status, message, errors = null) => {
    const response = {
      success: false,
      message,
    };
    if (errors) {
      response.errors = errors;
    }
    return res.status(status).json(response);
  };
  
  // 統一的成功回應格式
  const successResponse = (res, status, data) => {
    return res.status(status).json({
      success: true,
      data,
    });
  };

  module.exports = {
    errorResponse,
    successResponse,
  };
