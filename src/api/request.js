import axios from "axios";
import { ElMessage } from "element-plus";

// 創建 axios 實例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  timeout: 15000, // 請求超時時間
});

// 請求攔截器
service.interceptors.request.use(
  (config) => {
    // 從 localStorage 獲取 token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // 如果是 FormData，不要設置 Content-Type，讓瀏覽器自動設置
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => {
    console.error("請求錯誤:", error);
    return Promise.reject(error);
  }
);

// 響應攔截器
service.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error("響應錯誤:", error);

    // 處理錯誤響應
    const message = error.response?.data?.message || "請求失敗";
    ElMessage.error(message);

    // 處理 401 未授權錯誤
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// 封裝請求方法
export const request = {
  get: (url, params) => service.get(url, { params }),
  post: (url, data, config = {}) => service.post(url, data, config),
  put: (url, data) => service.put(url, data),
  delete: (url) => service.delete(url),
  upload: (url, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return service.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  download: (url, params) =>
    service.get(url, {
      params,
      responseType: "blob",
    }),
};

export default service;
