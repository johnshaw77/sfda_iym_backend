const axios = require("axios");
const config = require("../config/externalApi");

// 創建 axios 實例
const apiClient = axios.create({
  baseURL: config.baseURL,
  timeout: config.timeout,
  headers: config.headers,
});

// 請求攔截器
apiClient.interceptors.request.use(
  (config) => {
    // 這裡可以添加通用的請求處理邏輯
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 響應攔截器
apiClient.interceptors.response.use(
  (response) => {
    // 這裡可以添加通用的響應處理邏輯
    return response.data;
  },
  (error) => {
    // 錯誤處理
    console.error("External API Error:", error.message);
    return Promise.reject(error);
  }
);

// 通用請求方法
const makeRequest = async (method, endpoint, data = null, params = null) => {
  try {
    const response = await apiClient({
      method,
      url: endpoint,
      data,
      params,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// 導出請求方法
module.exports = {
  get: (endpoint, params) => makeRequest("get", endpoint, null, params),
  post: (endpoint, data) => makeRequest("post", endpoint, data),
  put: (endpoint, data) => makeRequest("put", endpoint, data),
  delete: (endpoint) => makeRequest("delete", endpoint),
};
