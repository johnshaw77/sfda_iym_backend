// 配置對象
const config = {
  // ... existing config ...

  // 外部 API 配置
  externalApi: {
    baseURL: process.env.EXTERNAL_API_BASE_URL || "http://localhost:5000/api",
    timeout: parseInt(process.env.EXTERNAL_API_TIMEOUT || "30000"),
    apiKey: process.env.EXTERNAL_API_KEY,
  },

  // ... existing config ...
};
