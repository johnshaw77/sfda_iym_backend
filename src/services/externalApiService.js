const axios = require("axios");
const config = require("../config");

/**
 * 外部 API 服務
 * 用於與第三方 API（如 Python 分析服務）進行通信
 */
class ExternalApiService {
  constructor() {
    // 從配置中獲取外部 API 的基礎 URL
    this.baseURL = config.externalApi?.baseURL || "http://localhost:5000/api";

    // 創建 axios 實例
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30秒超時
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // 添加請求攔截器
    this.client.interceptors.request.use(
      (config) => {
        console.log(
          `外部 API 請求: ${config.method.toUpperCase()} ${config.url}`
        );
        return config;
      },
      (error) => {
        console.error("外部 API 請求錯誤:", error);
        return Promise.reject(error);
      }
    );

    // 添加響應攔截器
    this.client.interceptors.response.use(
      (response) => {
        console.log(`外部 API 響應: ${response.status} ${response.statusText}`);
        return response;
      },
      (error) => {
        console.error("外部 API 響應錯誤:", error.response || error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * 發送 GET 請求到外部 API
   * @param {string} url - 請求路徑
   * @param {Object} params - 查詢參數
   * @returns {Promise<Object>} - 響應數據
   */
  async get(url, params = {}) {
    try {
      const response = await this.client.get(url, { params });
      return response.data;
    } catch (error) {
      console.error(`GET ${url} 失敗:`, error);
      throw error;
    }
  }

  /**
   * 發送 POST 請求到外部 API
   * @param {string} url - 請求路徑
   * @param {Object} data - 請求體數據
   * @returns {Promise<Object>} - 響應數據
   */
  async post(url, data = {}) {
    try {
      const response = await this.client.post(url, data);
      return response.data;
    } catch (error) {
      console.error(`POST ${url} 失敗:`, error);
      throw error;
    }
  }

  /**
   * 發送 PUT 請求到外部 API
   * @param {string} url - 請求路徑
   * @param {Object} data - 請求體數據
   * @returns {Promise<Object>} - 響應數據
   */
  async put(url, data = {}) {
    try {
      const response = await this.client.put(url, data);
      return response.data;
    } catch (error) {
      console.error(`PUT ${url} 失敗:`, error);
      throw error;
    }
  }

  /**
   * 發送 DELETE 請求到外部 API
   * @param {string} url - 請求路徑
   * @returns {Promise<Object>} - 響應數據
   */
  async delete(url) {
    try {
      const response = await this.client.delete(url);
      return response.data;
    } catch (error) {
      console.error(`DELETE ${url} 失敗:`, error);
      throw error;
    }
  }
}

// 創建並導出單例實例
const externalApiService = new ExternalApiService();
module.exports = externalApiService;
