// 外部 API 服務配置
const externalApiConfig = {
  // FastAPI 服務基礎 URL
  baseURL: process.env.EXTERNAL_API_URL || "http://localhost:8000",

  // 請求超時設置（毫秒）
  timeout: 5000,

  // 重試配置
  retry: {
    maxRetries: 3,
    retryDelay: 1000,
  },

  // 快取配置
  cache: {
    enabled: true,
    ttl: 300000, // 5分鐘
  },

  // 請求頭配置
  headers: {
    "Content-Type": "application/json",
  },
};

module.exports = externalApiConfig;
