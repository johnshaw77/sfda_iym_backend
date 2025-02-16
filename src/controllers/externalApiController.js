const externalApiService = require("../services/externalApiService");

// 測試外部 API 連接
const testExternalApi = async (req, res) => {
  try {
    const url = req.query.url || "/";
    const apiEndpoint = req.query.apiEndpoint || "methods";
    // 這裡假設外部 FastAPI 有一個 /health 或 / 端點
    const response = await externalApiService.get(apiEndpoint);

    return res.json({
      success: true,
      message: "外部 API 連接成功",
      data: response,
    });
  } catch (error) {
    console.error("外部 API 測試失敗:", error);
    return res.status(500).json({
      success: false,
      message: "外部 API 連接失敗",
      error: error.message,
    });
  }
};

module.exports = {
  testExternalApi,
};
